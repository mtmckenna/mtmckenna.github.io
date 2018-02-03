---
layout: post
title: Creating a Canvas Overlay
---

[![Basketball Bouncing Over the DOM](/images/creating-a-canvas-overlay.gif)](https://mtmckenna.github.io/creating-a-canvas-overlay/)

The [HTML canvas element](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) is great for [creating games in JavaScript](https://www.basketbalrog.com), but it can also be used to add a little bit of flare to a regular old website.

For example, I recently added a canvas overlay to [Basketbalrog](https://www.basketbalrog.com) that adds a tiny interactive basketball to the screen while still allowing a user to click on the links underneath the canvas and use the website as expected.

To make this happen, I configured a few CSS rules on the canvas:

```
#canvas {
  position: absolute;
  z-index: 2;
  pointer-events: none;
}
```

<ol>
<li>First, I made the canvas' position absolute so it exists outside of the normal document flow.</li>
<li>Next, I set the canvas' z-index to 2 so it's "on top" of the DOM.</li>
<li>Finally, I set the pointer-events style to "none" so the canvas doesn't block the DOM from handling pointer events (e.g. click, hover, etc.)</li>
</ol>

You can see what this ends up looking like [here](https://mtmckenna.github.io/creating-a-canvas-overlay/).

The rest of the code is plain old JavaScript interacting with the canvas element. I put a [copy of the code here on GitHub](https://github.com/mtmckenna/creating-a-canvas-overlay) in case that's handy.
