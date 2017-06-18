---
layout: post
title: Trying to Tree-shake Three.js with Rollup
---

![Rotating 3D model of a building](/images/three-js-tree-shaking.gif)

For those unfamiliar with it, [Three.js](https://threejs.org/) is a popular JavaScript library used to render 3D graphics on the web via WebGL.

While Three.js is an incredible library, it's also fairly large. The [minified version](https://threejs.org/build/three.min.js) (0.85.2) is 504K, and the gzip-compressed version is 128K. 128K over-the-wire may not be exorbitant for most apps, but perhaps you're in a situation where you're focusing on reducing your app's final bundle size.

To see if I could reduce the file size of a Three.js app, I tried to take advantage of [Three.js having converted to ES6 modules](https://github.com/mrdoob/three.js/pull/9310) and [Rollup.js](https://rollupjs.org)'s ability to remove unused parts of ES6 modules from an app's final bundle. This process of removing unused parts of a module is called "[tree-shaking](https://medium.com/@roman01la/dead-code-elimination-and-tree-shaking-in-javascript-build-systems-fb8512c86edf)."

Unfortunately, when I tried to tree-shake this [small Three.js app](http://lackadaisical-month.surge.sh/), I didn't see much savings. The minified file, which admittedly includes both the app code and the library, is still a bulky 482K minified and 121K compressed. That only amounts to 7K worth of savings. Bummer!

But maybe I did something wrong? Or maybe Three.js isn't yet optimized to take advantage of tree-shaking? Or maybe something else?

I put the [project on GitHub](https://github.com/mtmckenna/three-rollup-starter) in case anybody would like to take a look. Please let me know if you have ideas!
