---
layout: post
title: Using Ember.js for Game Development
---

![Rotating Cube](/images/using-ember-for-game-dev.gif)

[Ember.js](https://emberjs.com/) is the core of _[Space Pizzas'](https://www.spacepizzas.com)_ tech stack because it allows me to avoid many of the boring parts of programming in JavaScript. Figuring out how to [draw graphics](https://threejs.org/), [deal with networking issues](http://gafferongames.com/networking-for-game-programmers/), and all the other difficulties involved in developing a game is hard enough such that I didn't want to also have to deal with the annoyance of maintaining a bunch of boilerplate code just to get my basic development requirements up and running.

For example, because I'm using Ember, I don't have to worry about building or maintaining _Space Pizzas'_ [asset pipeline](https://ember-cli.com/), [data flow](https://dockyard.com/blog/2015/10/14/best-practices-data-down-actions-up), [testing infrastructure](https://guides.emberjs.com/v2.12.0/testing/), or [deployment process](http://ember-cli-deploy.com/). Not having to worry about these concerns has allowed me to focus on the game's business logic rather than, say, switching my testing framework when my current one has gone out of favor. Once you get used to the freedom of not having to sink time into development tasks orthogonal to your project's value proposition, it's hard to go back.

These conveniences are what has kept me developing in Ember the past few years. In fact, I was so excited about Ember's allowing me to focus on the fun parts of JavaScript programming, I put together a talk for [EmberConf 2016](http://2016.emberconf.com/) called [Build a Game in Ember Starring Your Cat](https://youtu.be/t9v3CBowdxw) that outlines how I used Ember to develop my first game, [Croissant the Pizza Cat](http://www.croissantthepizzacat.com). When moving from 2D games to 3D games while working on _Space Pizzas_, I found that Ember's best practices were just as valuable, and I put together another talk called [WebGL in Ember](https://speakerdeck.com/mtmckenna/webgl-in-ember). The image above is a GIF from the [Three.js in Ember](https://threejs-in-ember.mtmckenna.com/) app I put together to demonstrate how I used Ember to help draw 3D graphics using [Three.js](https://threejs.org/).

Time is often the limiting resource for programming projects, and my game dev projects are no different. For that reason, I'm using Ember to avoid the timesink that comes from the seemingly endless churn and reinvention of JavaScript best practices.
