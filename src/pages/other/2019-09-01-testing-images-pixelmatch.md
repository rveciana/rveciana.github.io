---
layout: ../../layouts/Post.astro
title: "Testing generated images with pixelmatch"
pubDate: 2019-09-01
teaser: d3-composite-projections.png
categories: other
tags: [testing]
thumbnail: /images/d3/d3-composite-projections2/twitter.png
twitter-card: summary
description: Testing image generation with pixelmatch, a pure JavaScript library
---

Checking the result of image generation was quite difficult using JavaScript until pixelmatch appeared.

To test [d3-composite-projections][d3-composite-projections], I used to copy the approach of the d3-geo-projection, which used [imagemagik] and now [graphicsmagick][graphicsmagick].

I found that comparing if the expected image was like the libary stopped working if I changed the computer. Slightly different versions of the libraries create different outputs that are visually identically.

## Pixelmatch

Pixelmatch describes itself as

> The smallest, simplest and fastest JavaScript pixel-level image comparison library.

It's got a command line command and can be used from JavaScript on node or the browser, which is what makes it cool for testing.

The function we need is really simple:

    pixelmatch(img1, img2, output, width, height[, options])

Where

- img1 and img2 are the images data to compare. We'll see how to read them
- output is the place to write the image data with the differences (or null, when it writes nothing)
- width and height are the dimensions of the three images
- Options have a threshold option that allows the images to be slightly different, which can be great in some cases.

The output is the number of pixels that are different, so we'll check if it's 0 for testing.

I'm using tape to make the tests. Because d3js uses it and becase is simple and great.

The function would be:

{% highlight js %}
tape("Checks the actual image outputs", async function(test) {
projections.forEach(async d => {
await render(d.name, d.topojson, d.field);
let img1 = PNG.sync.read(fs.readFileSync("test/output/" + d.name + ".png"));
let img2 = PNG.sync.read(fs.readFileSync("test/samples/" + d.name + ".png"));
let diff = pixelmatch(img1.data, img2.data, null, img1.width, img1.height, {threshold: 0.0});

        test.true(diff == 0, d.name + " matches the sample file");

       });
    test.end();

});
{% endhighlight %}

You can check [the whole script here][test-example]

- Note that there are many files to test, so a _forEach_ is used to check them
- We'll see the render function, but it does what it seems, rendering the image
- Note that PNG.sync.read is the method to get the generated images data

To create the images using canvas, the _canvas_ library is used, so:

    npm install --save-dev canvas

and require it using

    {createCanvas} = require("canvas")

Then, just get the context using

    context = canvas.getContext("2d");

and use it as in any browser example. Easy!

[This file][test-example] has the whole function.

Since everything is in JavaScript, node can run all the tests, for functions or rendering from the same tape call:

    tape 'test/*-test.js'

## Using ImageMagik or GraphicsMagik

If you are curious about the old method, the basic part was using something like:

    compare -metric rmse test/samples/projection.png test/output/projection.png

This uses [ImageMagik][imagemagik] to output if the two images are identical. To run the creation, a [bash script][imagemagik-script] is run. Of course, this makes it difficult to run it in Windows, for instance.

Newer d3 versions use [GraphicsMagik][graphicsmagik] to do the same. The good thing is that the output is similar to pixelmatch. The bad one is that is a bash script anyway.

    gm compare -type TrueColor -highlight-style assign -highlight-color red -file test/output/$i-difference.png test/output/$i.png img/$i.png;

## Links

- [pixelmatch][pixelmatch]
- [d3-composite-projections][d3-composite-projections]
- [ImageMagik][imagemagik]
- [GraphicsMagick Image Processing System][graphicsmagick]
- [ImageMagik bash script][imagemagik-script]
- [Tape testing][tape]
- [Testing example][test-example]

[pixelmatch]: https://github.com/mapbox/pixelmatch
[d3-composite-projections]: https://github.com/rveciana/d3-composite-projections
[imagemagik]: https://imagemagick.org/index.php
[graphicsmagick]: http://www.graphicsmagick.org/
[imagemagik-script]: https://github.com/rveciana/d3-composite-projections/blob/v1.0.2/test/compare-images
[tape]: https://github.com/substack/tape
[test-example]: https://github.com/rveciana/d3-composite-projections/blob/v1.2.3/test/render-test.js
