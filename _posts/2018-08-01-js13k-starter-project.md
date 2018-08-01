---
layout: post
title: Build, Zip, and Check the File Size of a js13kgames Project
---

[![Running the yarn party command in a terminal](/images/js13kgames-starter.gif)](https://github.com/mtmckenna/js13kgames-parcel-starter)

The [js13kgames](http://js13kgames.com/) competition is a [game jam](https://en.wikipedia.org/wiki/Game_jam) in which developers build a project with the constraint that their final version must be deployed as a single `index.html` file under 13kb when zipped. It's a fun idea, and some [amazing](http://js13kgames.com/entries/evil-glitch) [projects](http://js13kgames.com/entries/glitch-buster) [have](http://js13kgames.com/entries/behind-asteroids-the-dark-side) [come](http://js13kgames.com/entries/road-blocks) [out](http://js13kgames.com/entries/bunny-lost) of it.

I'm planning to build my own game in this year, so ahead of the August 13th start date, I wanted to find a development workflow to help me focus on building the game rather than futzing with tooling. To that end, I created this [js13kgames starter project](https://github.com/mtmckenna/js13kgames-parcel-starter), which uses the [Parcel bundler](https://parceljs.org/).

This starter project takes advantage of the convenience that Parcel provides (e.g. automatically handling TypeScript files) while also automating the annoying post-processing steps required to inline the JS/CSS assets, zip the file, and confirm the file is under 13,312 bytes. Finally, I wanted this project to work on both macOS and Windows, so the commands needed to be cross-platform.

To that end, I created [scripts inside the starter project repo](https://github.com/mtmckenna/js13kgames-parcel-starter/tree/master/scripts) that use a couple libraries to compress the file and display the final file size. These scripts are run via the `yarn party` command as shown in the GIF above.

If you try this starter, please let me know how it works out for you!
