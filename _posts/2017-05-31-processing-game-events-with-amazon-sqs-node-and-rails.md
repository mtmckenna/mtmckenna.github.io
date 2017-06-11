---
layout: post
title: Processing Game Events with Amazon SQS, Node, and Rails
---

![Diagram of Game Events System](/images/processing-game-events-diagram.png)

## Incrementing a Player's Score

Like many games, when a player shoots another ship in *[Space Pizzas](http://www.spacepizzas.com)*, the player's score is incremented by one. It seems like updating a player's score should be a pretty simple thing to do, but in the world of multiplayer web games, I think it can be pretty challenging.

Setting up the lay of the land: the *Space Pizzas* game client is built in [Ember](https://emberjs.com/) and runs in the browser. The browser connects to a [Node](https://nodejs.org/en/) server that runs the authoritative game logic (e.g. figures out if a bullet hits a ship). Finally, a [Rails](http://rubyonrails.org/) server handles user accounts and persisting data (e.g scores). Therefore, to register a point for a player, the following steps have to happen:

1. Player presses a button to fire a bullet (Ember)
2. Game detects a collision between the bullet and another ship (Node)
3. Game queues the hit event (Node)
4. Database stores the hit event (Rails)
5. Player's score is incremented (Rails)

That's a lot of steps. Perhaps, instead of the above system, it would have been easier to fold the Rails app's functionality into the Node app so there'd only be one server in the mix. However, it seems to me that the game-logic concerns are different enough from the user-logic concerns to warrant separating the servers.

## API or Event Queue?

Since I've spent much of my recent professional career working in web development, I figured the most obvious way to send data from Node to Rails would be through an API. If I had gone with this pattern, I would have first created the API in Rails. Next, I would have had the Node server send an HTTP request to the Rails server every time a ship was shot. The Rails server would then store the event and update the player's score.

However, one annoying downside of the API approach is that it'd be possible for the Node server to flood the Rails server with HTTP requests, causing the Rails server to slow or crash. Although the game doesn't currently receive enough traffic to warrant that concern, I figured that since *Space Pizzas* was already using [AWS Simple Queue Service](https://aws.amazon.com/sqs/) (SQS) to queue background jobs, I might also be able leverage SQS to queue `killed-ship` events from Node such that they would eventually be processed in Rails.

## Active Elastic Job

I originally connected the *Space Pizzas* Rails server to SQS in the service of queuing up password reset emails. That work was made much easier by a handy gem called [Active Elastic Job](https://github.com/tawan/active-elastic-job) that manages the interface between Rails and SQS.

The Active Elastic Job gem provides an adapter to translate messages sent from SQS into a format digestible by Rails' [Active Job](http://edgeguides.rubyonrails.org/active_job_basics.html) framework. The upshot is that if you're running a Rails server through [AWS Elastic Beanstalk](https://aws.amazon.com/elasticbeanstalk/), you can create a [worker environment](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/using-features-managing-env-tiers.html) that processes jobs stored in SQS. Using SQS saves you the trouble of having to configure a separate background job processor like [Sidekiq](http://sidekiq.org/) and a separate in-memory store like [Redis](https://redis.io/) or [AWS ElastiCache](https://aws.amazon.com/elasticache/).

There were two knock-on challenges that arose from the decision to use Active Elastic Job:

1. How can events be queued in development?
2. How can Node send events to SQS in a format that Active Elastic Job can process?

## Using Sidekiq in Development

I didn't want to depend on SQS just to get a development and test environment up and running. Fortunately Rails' Active Job framework makes it pretty easy to use Active Elastic Job in production and another adapter in development. To that end, in *Space Pizzas'* non-production environments, I'm using the venerable Sidekiq gem to queue and process jobs.

The only change required to use Sidekiq in development is a single if statement in Rails' `application.rb` file:

**config/application.rb:**

~~~
if Rails.env.production?
   config.active_job.queue_adapter = :active_elastic_job
else
   config.active_job.queue_adapter = :sidekiq
end
~~~

## Sending Active Elastic Jobs from Node

The next problem is that the Active Elastic Job gem was designed for a Rails server to both queue and process jobs, but the `killed-ship` event in *Space Pizzas* originates from a Node server. In order to send events from the Node server, I had to write a JavaScript class that does the following:

1. Wraps event data in a format that Active Elastic Job understands
2. Queues the job into either SQS or Sidekiq

The end result is the class below. When a ship is shot, the *Space Pizzas* Node app calls the `.enqueue` method to send the `killed-ship` event to SQS in production and Sidekiq in development.

**event-queuer.js:**

~~~
const Redis = require('redis');
const Sidekiq = require('sidekiq');
const AWS = require('aws-sdk');
const uuid = require('node-uuid');
const Promise = require('promise');
const crypto = require('crypto');

exports.EventQueuer = class {
  constructor(environment) {
    this.environment = environment;
    this.queueName = 'default_rails_queue';
    this.AWS = AWS;
    this.AWS.config.update({region: 'us-east-1'});
  }

  get sidekiq() {
    if (this._sidekiq) { return this._sidekiq; }
    this._sidekiq = new Sidekiq(this.redis);
    return this._sidekiq;
  }

  get redis() {
    if (this._redis) { return this._redis; }
    this._redis = Redis.createClient();
    return this._redis;
  }

  get sqs() {
    if (this._sqs) { return this._sqs; }
    this._sqs = new AWS.SQS();
    return this._sqs;
  }

  get sqsQueueUrlPromise() {
    if (this._sqsQueueUrlPromise) { return this._sqsQueueUrlPromise; }
    this._sqsQueueUrlPromise = this.newSqsQueueUrlPromise();
    return this._sqsQueueUrlPromise;
  }

  enqueue(eventType, data) {
    let payload = this.payloadFromData(data);

    if (this.environment !== 'production') {
      this.enqueueThroughSidekiq(eventType, payload);
    } else {
      this.enqueueThroughSqs(eventType, payload);
    }
  }

  enqueueThroughSidekiq(eventType, data) {
    this.sidekiq.enqueue(eventType, [data], {
      queue: this.queueName
    });
  }

  async enqueueThroughSqs(eventType, data) {
    let params = await this.sqsParams(eventType, data);
    this.sqs.sendMessage(params, function(error) {
      if (error) { console.error(error, error.stack); }
    });
  }

  payloadFromData(data) {
    data.occurred_at = Date.now();
    data.uuid = uuid.v4();

    return JSON.stringify(data);
  }

  newSqsQueueUrlPromise() {
    let params = { QueueName: this.queueName };
    return new Promise((resolve, reject) => {
      return this.sqs.getQueueUrl(params, function(error, data) {
        if (error) reject(error);
        else resolve(data['QueueUrl']);
      });
    }).catch((error) => console.error(error));
  }

  sqsSerializedJob(eventType, data) {
    return JSON.stringify({
      job_class: eventType,
      job_id: uuid.v4(),
      queue_name: this.queueName,
      priority: null,
      arguments: [data],
      locale: 'en'
    });
  }

  sqsMessageDigest(message) {
    let key = process.env.SECRET_KEY_BASE;
    return crypto.createHmac('sha1', key).update(message).digest('hex');
  }

  async sqsParams(eventType, data) {
    const queueUrl = await this.sqsQueueUrlPromise.then((url) => url);
    const messageBody = this.sqsSerializedJob(eventType, data);
    const messageDigest = this.sqsMessageDigest(messageBody);

    return {
      MessageBody: messageBody,
      QueueUrl: queueUrl,
      DelaySeconds: 0,
      MessageAttributes: {
        'message-digest': {
          DataType: 'String',
          StringValue: messageDigest
        },
        origin: {
          StringValue: 'AEJ',
          DataType: 'String'
        }
      }
    };
  }
};
~~~

## Is This Good?

There is certainly a bit of added complexity involved in the way the two servers communicate, but now that the infrastructure is configured, I feel pretty confident that I won't flood the Rails server or drop events.

I'm interested to hear how other people have solved this problem. Let me know your thoughts!
