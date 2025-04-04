---
layout: post
title: Compile GZDoom on macOS
---

I'm not sure why I wanted to do it, but I wanted to compile GZDoom on my Mac, and found out it was a little complicated. Below, I'll share how I was able to compile GZDoom on macOS 15. Maybe it'll help you make a crazy new Doom mod like [GZDoom: Ray Traced](https://github.com/vs-shirokii/gzdoom-rt/).


The [ZDoom wiki page](https://zdoom.org/wiki/Compile_GZDoom_on_Mac_OS_X_11.2.2) describes the compilation steps, but it didn't include everything I had to do. In this post, I'll add to what is on the wiki page:

## Install XCode Command Line Tools

I already had XCode installed (downloaded from the App Store), but you can install it from the terminal like below:

```
xcode-select --install
```

## Install dependencies

The wiki says to use MacPorts, but I use [homebrew](https://brew.sh/). The command to install dependencies is almost the same:

```
brew install libjpeg-turbo fluidsynth openal-soft libsndfile mpg123 git cmake
```

## Compile ZMusic

ZMusic is a library used in multiple projects, including GZDoom. You'll need to compile it first to link it into GZDoom:

Clone the [Zmusic repo](https://github.com/ZDoom/ZMusic).

```
git clone git@github.com:ZDoom/ZMusic.git
```

Like GZDoom, ZMusic uses CMake to generate build scripts. To run CMake, run the following commands, starting within the ZMusic directory

```
mkdir build
cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
```

Finally, run make:

```
make
make install
```

Running with `install` will put files in $HOME/local/zmusic/lib.


## Clone the GZDoom repo

Clone GZDoom from your terminal:

```
git clone git@github.com:ZDoom/gzdoom.git
```

## Run CMake

GZDoom uses [CMake](https://cmake.org/) to generate cross-platform build scripts. 

To run CMake, go to the directory where you cloned the GZDoom repo and do the following:

```
mkdir build
cd build
cmake .. \
  -DCMAKE_BUILD_TYPE=Release \
  -DCMAKE_OSX_SYSROOT=$(xcrun --sdk macosx --show-sdk-path) \
  -DZMUSIC_INCLUDE_DIR=$HOME/local/zmusic/include \
  -DZMUSIC_LIBRARIES=$HOME/local/zmusic/lib/libzmusic.dylib \
  -DOPENAL_INCLUDE_DIR=/opt/homebrew/opt/openal-soft/include/AL \
  -DOPENAL_LIBRARY=/opt/homebrew/opt/openal-soft/lib/libopenal.dylib \
  -DDYN_OPENAL=OFF \
  -DHAVE_GLES2=OFF
```

Some info on the parameters:

- `DCMAKE_OSX_SYSROOT`: Path to the macOS SDK
- `DZMUSIC_INCLUDE_DIR`: Path to headers for ZMusic
- `DZMUSIC_LIBRARIES`: Path to the ZMusic library (that we just compiled)
- `DOPENAL_INCLUDE_DIR`: Path to the headers for OpenAL
- `DOPENAL_LIBRARY`: Path to the OpenAL library
- `DDYN_OPENAL`: Statically links OpenAL, which is required on macOS
- `DHAVE_GLES2`: Disables OpenGL ES 2.0 support (not needed for modern macOS)

## Build GZDoom

From within the build directory, build GZDoom across multiple CPUs:

```
make -j$(sysctl -n hw.ncpu)
```

## Yer done!

Now you should have `gzdoom.app` in your `build` directory. You're all set! Double-click on the app from finder or run `./gzdoom.app/Contents/MacOS/gzdoom` from the command line.

Hope this helps!