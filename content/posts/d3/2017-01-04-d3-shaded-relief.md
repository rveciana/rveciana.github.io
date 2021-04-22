---
layout: post
title: 'd3-shaded-relief'
date: 2017-01-04
categories: d3
tags: [raster, canvas, shaded relief]
teaser: d3-shaded-relief.png
description: Use d3js to create shaded relief images
thumbnail: /images/d3/d3-shaded-relief/twitter.png
twitter-card: summary
---

The [shaded relief](http://www.shadedrelief.com/) technique is a method for representing the topography which is prettier and intuitive.

I found [some examples](http://bl.ocks.org/mjhoy/5301594) about doing them with d3js, but required a previous preparation with gdal. I wanted to show how to create the effect using the DEM file directly. I added the tutorial to the [d3-raster-tools-docs](http://geoexamples.com/d3-raster-tools-docs/) tutorial.

The result:

<iframe frameborder="no" border="0" scrolling="no" marginwidth="0" marginheight="0" width="690" height="510" src="http://www.geoexamples.com/d3-raster-tools-docs/code_samples/dem-shaded.html"></iframe>

- [The code explanation]({{ site.baseurl }}/d3-raster-tools-docs/plot/shaded-relief.html)
- [The source code]({{ site.baseurl }}/d3-raster-tools-docs/code_samples/dem-shaded-page.html)
- [How to get the data]({{ site.baseurl }}/d3-raster-tools-docs/code_samples/swiss-page.html)

## Links

- [reliefshading](http://www.reliefshading.com/), a web with lots of examples and theory
- [shaded relief](http://www.shadedrelief.com/), with many gorgeous examples
- [The hillshade algorithm](http://edndoc.esri.com/arcobjects/9.2/net/shared/geoprocessing/spatial_analyst_tools/how_hillshade_works.htm)
- [A post](http://geoexamples.blogspot.com.es/2014/03/shaded-relief-images-using-gdal-python.html) with the same content, but using python
