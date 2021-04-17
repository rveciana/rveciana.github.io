---
layout: post
title: 'd3-raster-tools-docs'
date: 2016-12-19
categories: d3
tags: [raster, isolines, isobands, streamlines]
teaser: d3-raster-tools-docs.png
description: Use d3js for dynamic raster data drawing
thumbnail: /images/d3/d3-raster-tools-docs/twitter.png
twitter-card: summary
---

I've written a [short tutorial]({{ site.baseurl }}/d3-raster-tools-docs) explaining how to work with raster data and [d3js](https://d3js.org/) to create dynamic data visualizations.

Usually, the examples show how to place points or polygons on a map. Those examples are working with [vectorial data](http://gis.stackexchange.com/questions/57142/what-is-the-difference-between-vector-and-raster-data-models). But many datasets are rasters, so the lack of examples and libraries made difficult to use [d3js](https://d3js.org/) with meteorological data, [DEM data](https://en.wikipedia.org/wiki/Digital_elevation_model), etc.

Some common representations could be easily done with existing libraries, others didn't have available tools. This tutorial will show how to use:

- [geotiff](https://github.com/constantinius/geotiff.js): Reading the GeoTIFF data (not the projectiopn, which would be cool)
- [raster-streamlines](https://github.com/rveciana/raster-streamlines): Drawing [streamlines](https://en.wikipedia.org/wiki/Streamlines,_streaklines,_and_pathlines) from vectorial fields
- [raster-marching-squares](https://github.com/rveciana/raster-marching-squares): Creating the isobands with the wind speed
- [reproject](https://github.com/perliedman/reproject): Reprojecting the generated GeoJSON
- [proj4js](http://proj4js.org/): Reprojecting points

And examples for all the common raster visualizations covered by the [Basemap library](http://basemaptutorial.readthedocs.io/en/latest/). All the examples have the _Canvas_ and the _SVG_ version so it's easy to use the most convenient.

[The tuorial can be found here.]({{ site.baseurl }}/d3-raster-tools-docs)

I will add more examples in the future, if I find that some cases were not covered.

Some of the examples are listed below:

|----------|:-------------:|
|[<img src="{{ site.baseurl }}/images/d3/d3-raster-tools-docs/arrows.png" /> Wind arrows]({{ site.baseurl }}/d3-raster-tools-docs/code_samples/wind-arrows-page.html) | [<img src="{{ site.baseurl }}/images/d3/d3-raster-tools-docs/barbs.png" /> Wind barbs]({{ site.baseurl }}/d3-raster-tools-docs/code_samples/wind-barbs-page.html) |
|[<img src="{{ site.baseurl }}/images/d3/d3-raster-tools-docs/raster-interpolate.png" /> Raster interpolation]({{ site.baseurl }}/d3-raster-tools-docs/code_samples/raster-interpolation-page.html) | [<img src="{{ site.baseurl }}/images/d3/d3-raster-tools-docs/raster-pixel.png" /> Raster original pixels]({{ site.baseurl }}/d3-raster-tools-docs/code_samples/raster-pixels-page.html) |
|[<img src="{{ site.baseurl }}/images/d3/d3-raster-tools-docs/isolines.png" /> Isolines]({{ site.baseurl }}/d3-raster-tools-docs/code_samples/isolines-page.html) | [<img src="{{ site.baseurl }}/images/d3/d3-raster-tools-docs/isolines-labels.png" /> Isolines with labels]({{ site.baseurl }}/d3-raster-tools-docs/code_samples/isolines-labels-page.html) |
|[<img src="{{ site.baseurl }}/images/d3/d3-raster-tools-docs/isobands.png" /> Isobands]({{ site.baseurl }}/d3-raster-tools-docs/code_samples/isobands-page.html) | [<img src="{{ site.baseurl }}/images/d3/d3-raster-tools-docs/streamlines.png" /> Streamlines]({{ site.baseurl }}/d3-raster-tools-docs/code_samples/streamlines-page.html) |
|[<img src="{{ site.baseurl }}/images/d3/d3-raster-tools-docs/projection.png" /> Projected GeoTIFF]({{ site.baseurl }}/d3-raster-tools-docs/code_samples/wind-barbs-projected-page.html) | [<img src="{{ site.baseurl }}/images/d3/d3-raster-tools-docs/raster-interpolate-projection.png" /> Projected raster interpolation]({{ site.baseurl }}/d3-raster-tools-docs/code_samples/raster-interpolation-projected-page.html) |
