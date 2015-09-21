---
layout: post
title:  "Mapping EUROSTAT data with D3js: Creating the TopoJSON"
date:   2015-09-21
categories: d3
tags: [EUROSTAT, Open Data]
teaser: d3-nuts.png
---

<img width="50%" src="{{ site.baseurl }}/images/d3/d3-nuts/example.png"/>

[click to see the original map by EUROSTAT][example map]

Creating NUTS regions file
--------------------------
[Download the NUTS regions in shp format][download regions]

It's interesting to have the population associated to each region, so the absolute number of some statistics can be changed to density (number of crimes to crimes/100000 people, for instance). The population data can be downloaded from [this url][population data]:

Select the population columns
Format->numerical format->number  11.000.638 --> 11000638
Save as csv
Remove headers and appended data

The header will be:

    GEO,GEO(L)/TIME,2010,2011,2012,2013,2014

And I changed it to

    id,name,pop2010,pop2011,pop2012,pop2013,pop2014

The reason is that the *topojson* program failed to take numeric column names (2013, in our case), and the complex *GEO(L)/TIME*.

To separate the data into different files for each NUTS level, so the file to load from the browser is smaller:

    ogr2ogr  -where "STAT_LEVL_=1" nuts1.shp NUTS_RG_01M_2013.shp

For level 1. To get all the levels, levels 0,1,2,3 must be generated.

To create the final topoJSON for nuts level 1, type:

    topojson -e demo_r_pjanaggr3.csv --id-property NUTS_ID,id -p nuts_id=NUTS_ID,name,population=+pop2013 -o nuts1.json -- nuts1.shp


Using the generated files
-------------------------

If yo don't want to create the same topojson, you can just get them from [this GIST][gist], with the names nuts0.json, nuts1.json, etc.

[Here][example gist], you can see a [working example][example gist] too, that gives this result: <img  src="{{ site.baseurl }}/images/d3/d3-nuts/example-gist.png"/>



[download regions]: http://ec.europa.eu/eurostat/web/gisco/geodata/reference-data/administrative-units-statistical-units
[population data]: http://appsso.eurostat.ec.europa.eu/nui/show.do?dataset=demo_r_pjanaggr3&lang=en
[example map]: http://ec.europa.eu/eurostat/statistics-explained/images/a/ae/Urban_rural_typology_for_NUTS3_new.png
[gist]: https://gist.github.com/rveciana/5919944
[example gist]: http://bl.ocks.org/rveciana/4bcc5750c776c22ffda6
