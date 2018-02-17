---
layout: post
title:  Mapping with gpu.js
date:   2018-02-01
teaser: gpujs-mapping.png
categories: other
tags: [GPU, gpujs, canvas]
thumbnail: /images/other/gpujs-mapping/twitter.png
twitter-card: summary
description: Use the GPU to calculate and draw data layers
---

[gpu.js][1] is a JavaScript Acceleration library for [GPGPU (General purpose computing on GPUs)][2] in Javascript. This means, basically, using the GPU instead of the CPU for the calculations, and coding in simple JavaScript.

The library is awesome, but I found some issues trying to run my things, so I will try to put all my steps here, which will help me in first place.

Including the library
---------------------

From a regular web page, just include:

{% highlight js %}
<script src="/path/to/js/gpu.min.js"></script>
{% endhighlight %}

then, initialize the library calling

{% highlight js %}
const gpu = new GPU();
{% endhighlight %}

It's possible to pass to the GPU constructor the options:

    {mode: 'gpu'} or {mode: 'cpu'}

Setting it forces the use of the CPU, which can be nice for performance comparison.

Using node, just install it with:

    npm install gpu.js

And require the module with:



### ObservableHQ

[ObservableHQ][3] is a new and awesome site to publish interactive examples. Requiring libraries is possible, but they have to be in UMD or AMD, which is not the case of [gpu.js][1]. A working solution is using the [wzrd][4] service

{% highlight js %}
GPU = require('https://wzrd.in/standalone/gpu.js')
{% endhighlight %}

First working example
---------------------

Let's see the simplest calculation using node:

{% highlight js %}
var GPU = require("gpu.js");
var gpu = new GPU();

var gpuKernel = gpu.createKernel(function() {
    return (this.thread.x + this.thread.y);
}).setOutput([2,2]);

console.info(gpuKernel());
{% endhighlight %}

* After initializing the class, a kernel is created with *createKernel*
  * The function that calculates every point is passed as the parameter
  This function has the *this.thread.x, this.thread.y and this.thread.z* variables that return the position in the matrix to calculate
  * In the *setOutput* method, the size of the matrix is set
* Just call the created kernel to calculate the values

Some more things about this functions:

* They can take array arguments

  function(points){...}

and call it

  gpuKernel([1,2,3])

* The size of the matrix is not accessible, unless a constant is declared

{% highlight js %}
var gpuKernel = gpu.createKernel(function() {
    for(let i = 0; i <this.constants.xSize; i++){
      ....
    }
    return (this.thread.x + this.thread.y);
}).setOutput([2,2])
  .setConstants({xSize:2, ySize: 2});
{% endhighlight %}

* The JavaScript operators that can be called inside the kernel functions are quite limited. [Here's the list][6]. Also, no *console.log* and many other functions can go there.

Drawing directly on a Canvas
----------------------------

One of the points that make [gnu.js][1] really interesting is that the gpu function can draw directly on a Canvas element, which is what we need when mapping. Here's a simple example, to run directly on the browser:

{% highlight js %}
<!DOCTYPE html>
<meta charset="utf-8">
<body>
    <script src="gpu.min.js"></script>
<script>
const gpu = new GPU();
const render = gpu.createKernel(function() {
    this.color(this.thread.x/500, this.thread.y/500, 0.4, 1);
})
  .setOutput([500, 500])
  .setGraphical(true);

render();
const canvas = render.getCanvas();
document.getElementsByTagName('body')[0].appendChild(canvas);

</script>
{% endhighlight %}

* The method *setGraphical(true)* has to be called to make the kernel draw on a Canvas. The *setOutput* method will set now the Canvas size
* Later, get the Canvas with *getCanvas()*
* Inside the function, set the *this.color* field with four values (rgba) from 0 to 1
* The y axis goes bottom to top! This is the opposite of the usual notation

It's easy! The result looks like this:

<img src="{{ site.baseurl }}/images/other/gpujs-mapping/result1.png"/>

Some algorithms
---------------

### Inverse of the distance

In [one of the first posts of this blog][7] I made a python script for drawing a grid from a set of scattered points. Using gpu.js this can be done at real-time and see the results when changing the parameters, as in [this ObservableHQ notebook][100]

### Hillshade

Projecting the data
-------------------

As usual, there are two possible situations: 

1- The raster has the projection you want to show. Congratulations. You can use the canvas element directly
2- The raster must be reprojected. The solution is not easy, since d3 projection functions won't work with gpu.js, so the job will be slow as in [this ObservableHQ example][104]. Reprojecting the raster is possible if the projection formulas are coded directly.

Links
-----

* [The gpu.js web site][1]
* [GPGPU Wikipedia page][2]
* [ObservableHQ][3]
* [wzrd.in][4]
* [generateMatrices source][5]
* [List of gpu.js supported math functions][6]
* [Creating a grid from scattered data using inverse of the distance with python (gdal_grid approach)][7]

### ObservableHQ notebooks

* [Most basic gpu.js example][100]
* [Most basic gpu.js example with performance test][101]
* [Basic gpu.js canvas example][102]
* [Inverse of the distance with gpu.js][103]
* [Shaded relief with gpu.js and d3.js][104]
* [Shaded relief with gpu.js drawing the canvas directly][105]

### Blocks with some of the examples

* [Basic gpu.js canvas example][200]
* [Inverse of the distance with gpu.js][201]

[1]: http://gpu.rocks
[2]: https://en.wikipedia.org/wiki/General-purpose_computing_on_graphics_processing_units
[3]: https://observablehq.com
[4]: https://wzrd.in/
[5]: https://hackernoon.com/introducing-gpu-js-gpu-accelerated-javascript-ba11a6069327
[6]: https://github.com/gpujs/gpu.js?utm_source=recordnotfound.com#supported-math-functions
[7]: http://geoexamples.blogspot.com.es/2012/05/creating-grid-from-scattered-data-using.html

[100]: https://beta.observablehq.com/@rveciana/most-basic-gpu-js-example
[101]: https://beta.observablehq.com/@rveciana/gpu-js-check-execution-time
[102]: https://beta.observablehq.com/@rveciana/basic-gpu-js-canvas-example
[103]: https://beta.observablehq.com/@rveciana/inverse-of-the-distance-with-gpu-js
[104]: https://beta.observablehq.com/@rveciana/shaded-relief-with-gpujs-and-d3js
[105]: https://beta.observablehq.com/@rveciana/shaded-relief-with-gpujs-and-d3js/2

[200]: https://bl.ocks.org/rveciana/c664dffd8b94f0598543958433d415f4
[201]: https://bl.ocks.org/rveciana/7419081f8931227769bae5255579e792