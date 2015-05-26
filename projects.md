---
layout: page
title: Projects
permalink: /projects/
---
Some of my personal projects:

<h2><a href="http://geoexamples.com/d3-composite-projections/">d3-composite-projections</a></h2>
<a href="http://geoexamples.com/d3-composite-projections/"><img class="teaser" src="{{ site.baseurl }}/images/teasers/d3-composite-projections.png" alt="teaser" itemprop="image"></a>
Set of d3 projections for showing countries' distant lands together.

Drawing choropleth maps is difficult in some countries when parts of them are far away from the mainland. This set of projections work like the original [AlbersUSA projection](https://github.com/mbostock/d3/wiki/Geo-Projections#albersUsa), putting all the regions together.

<h2><a href="https://basemaptutorial.readthedocs.org/en/latest/">Basemap tutorial</a></h2>
<a href="https://basemaptutorial.readthedocs.org/en/latest/"><img class="teaser" src="{{ site.baseurl }}/images/teasers/basemaptutorial.png" alt="teaser" itemprop="image"></a>
Basemap is a great tool for creating maps using python in a simple way. It’s a matplotlib extension, so it has got all its features to create data visualizations, and adds the geographical projections and some datasets to be able to plot coast lines, countries, and so on directly from the library.

Basemap has got [some documentation](http://matplotlib.org/basemap/index.html), but some things are a bit more difficult to find. I started this documentation to extend a little the original documentation and examples, but it grew a little, and now covers many of the basemap possibilities.

<h2><a href="http://www.gdal.org/frmt_various.html#IRIS">GDAL IRIS driver</a></h2>
<a href="http://www.gdal.org/frmt_various.html#IRIS"><img class="teaser" src="{{ site.baseurl }}/images/teasers/gdal-iris-driver.png" alt="teaser" itemprop="image"></a>
VAISALA/SIGMET weather radars have their own format to store the generated products, so opening them can be quite difficult without their software.

This driver, integrated in the default [GDAL library](http://www.gdal.org/), makes possible to open these files from any software using GDAL, including [QGIS](www.qgis.org) and the [GDAL Python bindings](http://trac.osgeo.org/gdal/wiki/GdalOgrInPython).
