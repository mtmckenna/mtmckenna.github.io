---
layout: post
title: Construct Interactive Voronoi Edges In Canvas
---

<div class="center-contents">
    <iframe src="/assets/html/voronoi.html" title="Voronoi Diagram" class="iframe"></iframe>
    <br />
    <em>Click and drag to move the rotating box around the Voronoi diagram</em>
</div>
# Introduction

I wrote some code to generate Voronoi diagrams such that I could use the edges of the diagram as interactive objects. I started down this path because I am interested in making a driving game where the roads are procedurally generated, and I learned from [this video by Herbert Wolverson](https://www.youtube.com/watch?app=desktop&v=TlLIOgWYVpI) that Voronoi Diagrams is one way to do it. While there are JavaScript libraries to do this, I wanted to code this up from scratch for two reasons: 1) to learn the algorithm and 2) to keep the file size small since I intend to use this on a JS13k gamejam.

In the canvas above, you can click/tap and drag to move the spinning square along each gray edge. When the edge overlaps the square, the edge will turn blue and a red line representing the overlap will appear.

# What is a Voronoi Diagram

The short version is that a Voronoi diagram partitions a plane into regions. These regions are divided up such that every point within a given region is closest to a “seed” point. These is easier to understand by looking at a diagram:

![Voronoi Diagram](/images/voronoi.png){:.center-item style="max-height: 300px"}
[*Image from Wikipedia*](https://en.wikipedia.org/wiki/Voronoi_diagram#/media/File:Euclidean_Voronoi_diagram.svg)
{:.center-contents}

The different colored polygons are regions and the block dots are seeds.

One way a Voronoi diagram can be helpful is to generate new randomly generated game levels where the edges represent roads. Admittedly, the roads in the interactive canvas at the top of this page doesn't look like any city I've been to, but it'll be close enough. 

# Steps

One note is that there is a simpler way to create Voronoi diagrams if you don’t need the edges to be their own objects and are instead more interested in seeing the visuals. This [Coding Train video](https://www.youtube.com/watch?v=4066MndcyCk) shows how to do this, albeit with Worley  Noise instead of strictly Voronoi Diagrams.  However, to be able to handle collision detection, I needed each road to be its own object and therefore couldn’t go pixel by pixel.

The process I followed was pulled from a few blog posts and videos, notably [this one at Gorilla Sun](https://www.gorillasun.de/blog/delaunay-triangulation-and-voronoi-diagrams/) and [this video by Scott Anderson](https://www.youtube.com/watch?v=4ySSsESzw2Y&t=21s).

There are a lot of steps in the process, but the high level outline goes like this:

- Generate Delaunay triangulation of a set of points
- Convert the Delaunay triangles to a set of edges of a Voronoi diagram
- Convert the Voronoi edges to game objects

## Generate Delaunay Triangulation

Creating a Voronoi diagram directly seemed hard, and it seems like the most straightforward way to create one is to first generate a "[Delaunay triangulation](https://en.wikipedia.org/wiki/Delaunay_triangulation)" and then convert that to a Voronoi diagram. A Delaunay triangulation is a set of triangles such that no point in the set of points is inside the circumcircle of any triangle (a circle which passes through all the vertices of the triangle). In other words, it generates triangles, and all the "seed" points are verticies in the generated triangles. Like the rest of this post, the idea is easier to understand by looking at a picture:

![Delaunay triangulation](/images/delaunay.png){:.center-item style="max-height: 300px"}
[*Image from Wikipedia*](https://en.wikipedia.org/wiki/Delaunay_triangulation#/media/File:Delaunay_circumcircles_vectorial.svg)
{:.center-contents}

Note that all the circles go through the vertices of the triangles, and there are no other points are inside of any circle. There are apparently various applications for Delauney triangulation, but the main usecase here is that the circumcenters (the center of a triangle's circumcircle) and edges can be converted to a Voronoi diagram.

### How to Generate a Delaunay triangulation

## Convert Delaunay Triangles to Voronoi Edges

## Convert the Voronoi Edges to Game Objects



