---
layout: post
title: Compiling a C++ OpenGL Project for OS X and WebAssembly
---

[![A colorful triangle in WASM](/images/opengl-osx-and-wasm.png)](https://wasm-triangle.netlify.com/)


## The Goal

I'm working on a C++/OpenGL project that I'm trying to compile for both native OS X and [WebAssembly](https://webassembly.org/) (WASM). The reason I wanted to be able to build for both targets is because my plan is to use the native build during development and the WASM build for release.

While there are a lot of [helpful](https://uncovergame.com/2015/01/21/porting-a-complete-c-game-engine-to-html5-through-emscripten/) [resources](https://gist.github.com/isc30/d379e40cbe4f0f34a3ee9ddeda2666db) to get started programming in C++, [OpenGL](https://open.gl), and WASM, I couldn't find anything that exactly explained setting up a development workflow that allows me to build for both OS X and WASM. In this post, I'll go over the way I was able to get my workflow going.

[Here's a link to the WASM version of the build](https://wasm-triangle.netlify.com/) you can see in your browser and [here's a link to the GitHub repo](https://github.com/mtmckenna/opengl-osx-wasm) containing all the files.

## Dependencies

- [Emscripten](https://emscripten.org/) to compile for WASM
- [GLEW](http://glew.sourceforge.net/) to handle some cross-platform business
- [SDL2](https://www.libsdl.org/index.php) to handle window creation, input handling, etc.

On OS X, it's easy enough to install all three dependencies with [Homebrew](https://brew.sh/): `brew install emscripten glew sdl2`

## Switching Between OpenGL 2.0 and OpenGL ES 2.0

OS X and web browsers implement different versions of OpenGL: OS X supports OpenGL 2.0 (and higher) while web browsers support [WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API), which is based on OpenGL ES 2.0. Therefore, when building for OS X, I had to target OpenGL 2.0. When building for WASM, I targeted OpenGL ES 2.0. Here's the code that does that:

```
int main()
{
  SDL_Init(SDL_INIT_EVERYTHING);

  #if __EMSCRIPTEN__
  SDL_GL_SetAttribute(SDL_GL_CONTEXT_PROFILE_MASK, SDL_GL_CONTEXT_PROFILE_ES);
  SDL_GL_SetAttribute(SDL_GL_CONTEXT_MAJOR_VERSION, 2);
  SDL_GL_SetAttribute(SDL_GL_CONTEXT_MINOR_VERSION, 0);
  #else
  SDL_GL_SetAttribute(SDL_GL_CONTEXT_PROFILE_MASK, SDL_GL_CONTEXT_PROFILE_CORE);
  SDL_GL_SetAttribute(SDL_GL_CONTEXT_MAJOR_VERSION, 2);
  SDL_GL_SetAttribute(SDL_GL_CONTEXT_MINOR_VERSION, 0);
  #endif
...
```

## Main Loop

[As the Emscripten docs mention](https://emscripten.org/docs/optimizing/Optimizing-WebGL.html#optimizing-load-times-and-other-best-practices), to not lock up the browser and instead take advantage of [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame), we can use `emscripten_set_main_loop` or its cousin `emscripten_set_main_loop_arg` in the WASM version rather than the infinite `while` loop in the OS X version. Here's how I ended up including both types of loops in my `app.cpp` file:

```
...
 #if __EMSCRIPTEN__
  emscripten_set_main_loop(loop, -1, 1);
  #else
  SDL_Event windowEvent;
  while (true)
  {
    if (SDL_PollEvent(&windowEvent))
    {
      if (windowEvent.type == SDL_QUIT) break;
    }
    loop();
  }
  #endif
...
```

## GLSL Versions

At least on my machine, I needed to specify the [GLSL](https://en.wikipedia.org/wiki/OpenGL_Shading_Language) version in the shaders as a preprocessor directive in order for the shaders to compile correctly for OS X. Using version `100` seemed to do the job, and based on [this wiki page](https://en.wikipedia.org/wiki/OpenGL_Shading_Language#Versions), it appears version 100 is also compatible with WebGL.

Here's an example of my vertex shader:

```
#version 100
attribute vec2 position;
attribute vec3 color;

varying vec3 vColor;

void main()
{
  vColor = color;
  gl_Position = vec4(position, 0.0, 1.0);
}
```

## Build Scripts

For OS X:

```
clang++ app.cpp -std=c++11 -Wall -Wextra -lglew -lsdl2 -framework OpenGL -g -v -o native/app
```

For WASM:

```
emcc --std=c++11 -Wall -Wextra -s WASM=1 -s USE_SDL=2 app.cpp -o wasm/app.html
```

Additionally, here's a [node script](https://github.com/mtmckenna/opengl-osx-wasm/blob/master/scripts/server.js) in the repo to load the WASM build locally.

## And That's It!



I'm sure there are more ways to do this sort of thing, so please let me know if you have any suggestions!
