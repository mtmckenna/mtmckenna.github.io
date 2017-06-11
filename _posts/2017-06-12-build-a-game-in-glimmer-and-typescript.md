---
layout: post
title: Prototyping a Game in Glimmer and TypeScript
---

![Croissant Hoops Animated GIF](/images/croissant-hoops.gif)

Play [Croissant Hoops](http://hoops.spacepizzas.com/)!

I took a break from working on [Space Pizzas](https://www.spacepizzas.com) to try out a couple web dev technologies that were new to me: [Glimmer](https://glimmerjs.com/) and [TypeScript](https://www.typescriptlang.org/). Glimmer is a component library (like [React](https://facebook.github.io/react/)) with quite a bit more tooling (like [Ember](https://emberjs.com)). TypeScript is superset of JavaScript that adds a type system in the service of making big applications less fraught with peril than your typical big JavaScript application.

Using the above technologies, I made a game called [Croissant Hoops](http://hoops.spacepizzas.com/) in the vein of [Qwiboo's](http://qwiboo.com/)  [Ball King](http://ballking.qwiboo.com/). The goal of the game is to use your mouse or finger to drag an arc that will drop the basketball into the hoop. The game can be played at [hoops.spacepizzas.com](http://hoops.spacepizzas.com/).

In case anyone is interested, [I put the source code on GitHub](https://github.com/mtmckenna/croissant-hoops).

As for Glimmer and TypeScript: I liked working with them both.

## Glimmer

I have preferred working in Ember for front end web dev work in general, and Glimmer provides a lot of the benefits of Ember (e.g. command line tools) without all the framework's "heavy" features. I did miss some of these features (like Ember's built-in testing suite), but many of the features Glimmer lacks compared to Ember aren't super relevant at the game-prototyping stage anyway.

Below, I've written a few initial thoughts on using Glimmer to build games.

### Where To Place Your POJOs

If you're making a game in JavaScript, it is likely you're going to have a number of [Plain Old JavasScript/TypeScript Objects](https://en.wikipedia.org/wiki/Plain_old_Java_object). For example, *Croissant Hoops* has a `game.ts` and `ball.ts`. Initially, I placed these POJOs on the `src/game` directory (e.g. `src/game/ball.ts`), but ember-cli gave me this error:

~~~
Error: The type of module 'ball' could not be identified
~~~

[Turns out](https://github.com/glimmerjs/resolution-map-builder/issues/8), ember-cli expects non-Glimmer modules to be in placed in the `src/utils` directory instead (e.g. `src/utils/game/ball.ts`).

### Actions

In [my Emberconf talk](https://www.youtube.com/watch?v=t9v3CBowdxw) about the [last game I built in Ember](https://www.croissantthepizzacat.com/), I talked about how Ember's components are a really useful way to handle a game's UI since HTML and CSS are well suited to deal with the variety of screen sizes on which your game may be played. Since Glimmer is a component system, I think the same point holds true: standard HTML/CSS is just as useful for building a responsive game UI as it is for building a responsive web app UI.

In *Croissant Hoops*, the UI that shows the score is displayed in the template like so:

**croissant-hoops/template.ts:**

~~~
{% raw %}
<div id="score">Score: {{score}}</div>
{% endraw %}
~~~

When a basket is scored, the game code in `game.ts` calls the `scoreCallback` method, which updates the score:

**croissant-hoops/component.ts:**

~~~
@tracked
score: number =  0;

scoreCallback(newScore: number)  {
  this.score = newScore;
}
~~~

I think having this separation of game code and game UI is really helpful since it allows the game code to focus on game logic and HTML/CSS to focus on layout.

## TypeScript

If you haven't used TypeScript, the above code might look pretty weird, what with the oddly placed colons and the `@tracked` line in there. In the above example, the `number` after the colon specifies the [type](https://www.typescriptlang.org/docs/handbook/basic-types.html) of the `score` property, and `@tracked` is a [decorator](https://www.typescriptlang.org/docs/handbook/decorators.html) that tells Glimmer to let the component/template know whenever `score` is updated.

If any of that is confusing, the good news is that since TypeScript is a superset of JavaScript, all your JS code still works in TS, and you may layer on TS features as you see fit.

Not having worked in a static typed language for a while, I appreciated TypeScript's transpiler catching errors that I wouldn't have caught until play testing. For example, if I changed the type of an argument in a function declaration but forgot to make the required changes to calls to that function, TypeScript would do me a favor and alert me in the compilation step. Without that, I would have had to wait until I ran the app and saw it crash to know I messed up.

While catching these errors during the compilation step would only be a small win if I only messed up once, I mess up a lot, so I found this feature really helpful. If I had TDD'd this project (as one probably should for most web apps), some of the benefit would be mitigated. However, when prototyping a small game like this, perhaps static typing is a more expedient way to learn.
