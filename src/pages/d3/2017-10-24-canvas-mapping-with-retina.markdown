---
layout: ../../layouts/Post.astro
title: Canvas mapping with a retina display
pubDate: 2017-10-24
categories: d3
tags: [raster, canvas, retina]
teaser: canvas-retina.png
description: Creating canvas maps compatible with retina screens
thumbnail: /images/d3/canvas-mapping-retina/twitter.png
twitter-card: summary
---

Using D3js with canvas is great for mapping, sice the performance you get in the client's browser is really better than using SVG. This is because the browser doesn't have to put in the DOM all the drawn elements, which in a map are usually not important (the background map, for instance). An example of this can be seen in [this example with dynamic projection](http://bl.ocks.org/rveciana/d5a398bdb55a6caec3e3931f347e4b70).

Also, a raster map can be created, as in [this other example](http://bl.ocks.org/rveciana/3753394b3b6fd22df2c867bb02b320b4). Or even faster styling as in [the chalkboard map example](http://bl.ocks.org/rveciana/00f82d7c630342c4a46f5e5c396cf327).

The problem in using _canvas_ is the _retina display_ devices, like the IPhone. We'll see how to manage this case in this post.

## Blurry edges

The image below shows the problem when drawing canvas with a retina display:
<img src="{{ site.baseurl }}/images/d3/canvas-mapping-retina/retina_example.png"/>
When setting up a _canvas_ element, the numebr of actual pixels in a retina display is 4 times the declared in the canvas. That's why the computer interpolates the drawing and gets the blur effect.

You can see the [example in the image here](https://bl.ocks.org/rveciana/fc4be951e972d945204ad79423c58106). If you don't have a retina display device, all the parts of the map will look ok. Take a look at the section below to simulate the retina display.

The way to solve it is pretty simple, just add:

{% highlight js %}
if (window.devicePixelRatio){
canvas
.attr('width', width _ window.devicePixelRatio)
.attr('height', height _ window.devicePixelRatio)
.style('width', width + 'px')
.style('height', height + 'px');

    context.scale(window.devicePixelRatio, window.devicePixelRatio);

}

```

- _window.devicePixelRatio_ is the property you can use to detect the retina display. The value is 1 (or -1) in regular devices and 2 in the retina displays
- The _canvas_ is made two times bigger in each dimension, so the number of pixels will be the good one
- The _canvas_ element is restyled to have the same dimensions we had at the begining, to it will look the same (but with more pixel density)
- The _context_ is scaled so when an element is drawn, the final size is two times bigger, as our canvas

[Here's the complete example](https://bl.ocks.org/rveciana/9b6971f583fb048b216e158235758629).

## What if I don't have any _retina display_ device?

I don't have it neither! Fortunately, firefox allows a way to simulate it:

- Open the address: _about:config_ and say that you really want to change stuff there
- Search the _layout.css.devPixelsPerPx_ property, which will be _-1.0_ by default
- Change it to 2
  Everything in the browser will look four times bigger, and when reloading the example, you will see the differences between having set properly or not the pixel ratio.

## Links

- [Example 1: Proper way to make a simple map with retina](https://bl.ocks.org/rveciana/9b6971f583fb048b216e158235758629)
- [Example 2: Comparing the proper and the wrong way](https://bl.ocks.org/rveciana/fc4be951e972d945204ad79423c58106)
- [Retina canvas example](https://bl.ocks.org/cmgiven/f2100df55e076f386c13ada4988b75e9)
- [Stack Overflow question about the topic](https://stackoverflow.com/questions/12243549/how-to-test-a-webpage-meant-for-retina-display)
- [Proper value in Firefox to change the resolution](https://support.mozilla.org/ca/questions/981038)
- [Source of the image used for this post](https://www.flickr.com/photos/ivyfield/4731067716)
```
