---
layout: post
title: Shell Script to Deploy and Activate Your Ember App to S3
---

[github-issue]: https://github.com/ember-cli/ember-cli-deploy/issues/121
[ember-cli-deploy]: http://ember-cli.github.io/ember-cli-deploy/
[ember-deploy-s3]: https://github.com/LevelbossMike/ember-deploy-s3
[ember-deploy-s3-index]: https://github.com/Kerry350/ember-deploy-s3-index
[script-gist]: https://gist.github.com/mtmckenna/2bbce8c14f520c78088b
[ember-cli-deploy-dotenv]: http://ember-cli.com/ember-cli-deploy/docs/v0.5.x/dotenv-support/

## *Update*

As Kori points out in the comments, version 0.5.0 of ember-cli-deploy now does most of what this shell script does, which is super great.

More specifically, ember-cli-deploy [supports .env files][ember-cli-deploy-dotenv], so you can place your AWS credentials in a
`.env.deploy.production` file within your root project directly like so:

```
AWS_KEY=<your key>
AWS_SECRET=<your secret>
```

You can then update your `config/deploy.js` file to use the environment variables listed in `.env.deploy.production` and activate the latest revision when you deploy. My `deploy.js` file looks like this:

```
module.exports = function(deployTarget) {
  var ENV = {
    build: {}
  };

  ENV.pipeline = {
    activateOnDeploy: true
  };

  if (deployTarget === 'production') {
    ENV.build.environment = 'production';

    ENV['s3'] = {
      accessKeyId: process.env['AWS_KEY'],
      secretAccessKey: process.env['AWS_SECRET'],
      bucket: <assets-bucket-name>,
      region: 'us-east-1',
      filePattern: '**/*.{js,css,png,gif,ico,jpg,map,xml,txt,svg,swf,eot,ttf,woff,woff2,wav}'
    }

    ENV['s3-index'] = {
      accessKeyId: process.env['AWS_KEY'],
      secretAccessKey: process.env['AWS_SECRET'],
      bucket: <index-bucket-name>,
      region: 'us-east-1'
    }
  }

  return ENV;
};
```

Once your `deploy.js` file is ready ready to go, you can deploy your Ember app with just one command: `ember deploy production`.

Thanks to the ember-cli-team for simplifying the deployment process!

## Introduction

For the purposes of this post, I'll assume you're deploying your Ember app to S3 using [ember-cli-deploy], [ember-deploy-s3], and [ember-deploy-s3-index].

Although it looks like it's on the [roadmap][github-issue], [ember-cli-deploy] doesn't currently have a one line comamnd to deploy and activate a revision. As it stands, there are two steps you must go through in order to deploy (push code to the S3) and the activate your code (make the latest revision live).

Here's the deploy step: `AWS_SECRET_KEY=SECRET-KEY ember deploy --environment=production`. This step will upload both your `index.html` file and your assets to S3.

Once the above command has finished, the terminal output will include the sha of the deployed revision. To activate this revision, you must copy the sha from the output and paste it into the following command: `AWS_SECRET_KEY=SECRET-KEY ember deploy:activate --revision=THE-SHA --environment=production`. The latest revision will then be live.

While running the above two commands isn't killer, it's still a lot of typing. To compress these two commands into one and also handle the AWS secret key, I wrote the [following script][script-gist].

## Script

Save the following script to your root Ember directory as `deploy-latest-revision-to-s3.sh`:

```
export AWS_SECRET_KEY=`cat .aws_secret_key`
ENVIRONMENT=production

ember deploy --environment=$ENVIRONMENT

if [ $? -eq 0 ]
then
  LATEST_REVISION="$(ember deploy:list --environment=$ENVIRONMENT | grep "1)" | awk '{print $2}')"
  ember deploy:activate --revision=$LATEST_REVISION --environment=$ENVIRONMENT
  echo "$(tput setaf 2)Deployed the heck out of the latest revision."
  exit 0
else
  echo "$(tput setaf 1)Something is jacked up with the deploy."
  exit 1
fi
```

## config/deploy.js

Your `config/deploy.js` will need to reference the AWS secret key as an environment variable. Here's an example `deploy.js`:

```
module.exports = {
  production: {
    store: {
      type: 'S3',
      accessKeyId: 'ACCESS_KEY_ID',
      secretAccessKey: process.env['AWS_SECRET_KEY'],
      bucket: 'www.example.com',
      hostName: 'www.example.com.s3-website-us-west-1.amazonaws.com',
      region: 'us-west-1'
    },

    assets: {
      accessKeyId: 'ACCCESS_KEY_ID',
      secretAccessKey: process.env['AWS_SECRET_KEY'],
      bucket: 'www.example.com-assets',
      region: 'us-west-1'
    }
  }
};
```

## Deploy

To use this script, paste your AWS secret key in an `.aws_secret_key` file at the root of your Ember app. Make sure you add `.aws_secret_key` to your `.gitignore` file so you don't commit the key to your repo.

Once you're all set, you should be able to deploy your app by typing the following command: `sh deploy-latest-revision-to-s3.sh`.
