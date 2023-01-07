---
layout: ../../layouts/Post.astro
title: "svg-path-properties"
date: 2016-12-01
categories: other
tags: [canvas, svg]
teaser: svg-path-properties.png
description: Get path properties working woth Canvas or nodejs
thumbnail: /images/other/svg-path-properties/twitter.png
twitter-card: summary
---

SVG has the [path element](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths), which allows to draw complex lines and curves. JavaScript has [some methods](https://developer.mozilla.org/ca/docs/Web/API/SVGPathElement) to get properties from paths, such as _getTotalLength()_ and _getPointAtLength()_, which are very useful when e.g. creating SVG animations with [D3js](https://d3js.org/) transitions.

Unfortunately, when working with a [Canvas element](http://www.w3schools.com/tags/ref_canvas.asp), or when working with nodejs, these functions are not available, making very difficult to obtain these informations.

That's why I made the [svg-path-properties library](https://github.com/rveciana/svg-path-properties)

## svg-path-properties library

# Install

To use with npm, just type:

    npm install svg-path-properties

To use it directly from the browser, include the script and call it with the prefix _spp_:

    <script src="https://unpkg.com/svg-path-properties@0.1.1/build/path-properties.min.js"></script>
    spp.svgPathProperties(path(track));

# Usage

First, require the library and initialize it with the path string:

    var path = require("svg-path-properties");
    var properties = path.svgPathProperties("M0,100 Q50,-50 100,100 T200,100");

Then, access the different properties with the different methods

Get the path total length in pixels:

    var length = properties.getTotalLength();

Get the point on the path at certain length (in pixels):

    var point = properties.getPointAtLength(200);

Get the tangent vector at certain length (in pixels):

    var tangent = properties.getTangentAtLength(200);

Get the point position and the tangent vector at the same time (more efficient than doing it with the separate methods):

    var allProperties = properties.getPropertiesAtLength(200);

## Some examples

[<img src="{{ site.baseurl }}/images/other/svg-path-properties/thumbnail_bostock.png"/>Canvas & svg-path-properties Point-Along-Path Interpolation](http://bl.ocks.org/rveciana/77655c3c0e3073c19da34af6dc84c4b9): Canvas version of [this block by Mike Bostock](http://bl.ocks.org/mbostock/1705868).

[<img src="{{ site.baseurl }}/images/other/svg-path-properties/thumbnail_path.png"/>Canvas path animation](http://bl.ocks.org/rveciana/209fa7efeb01f05fa4a544a76ac8ed91): A path on a map that draws itself to show a train route.

[<img src="{{ site.baseurl }}/images/other/svg-path-properties/thumbnail_isolines.png"/>Label positioning with svg-path-properties](http://bl.ocks.org/rveciana/bef48021e38a77a520109d2088bff9eb): Isolines labeling. Finding the position and angle isn't possible even with SVG paths alone.

[<img src="{{ site.baseurl }}/images/other/svg-path-properties/thumbnail_streamlines.png"/>Drawing streamlines from a GeoTIFF file](http://bl.ocks.org/rveciana/edb1dd43f3edc5d16ecaf4839c032dec): Marking the streamlines direction with an arrow isn't possible if the position and tangent is unknown.

I would be very happy to know if somebody is using it and creates something with the library.

## Links

- [SVG path element](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths)
- [SVG path access methods](https://developer.mozilla.org/ca/docs/Web/API/SVGPathElement)
- [Canvas element](http://www.w3schools.com/tags/ref_canvas.asp)
- [svg-path-properties library](https://github.com/rveciana/svg-path-properties)
