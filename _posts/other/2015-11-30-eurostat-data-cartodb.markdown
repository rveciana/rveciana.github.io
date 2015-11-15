---
layout: post
title:  "Mapping EUROSTAT data with CartoDB"
date:   2015-11-30
categories: other
tags: [EUROSTAT, Open Data, CartoDB]
teaser: cartodb-eurostat.png
---
It's been a long time since I wanted to learn how to use CartoDB. I had played a little with it, but without a small challenge it's difficult togo anywhere. So I've made a map with the same EUROSTAT data used in the [previous post][previous post].

Obtaining the data
------------------

I wrote how to get the data in the [previous post][previous post]. To get a ma with CartoDB, merging the data file and the shapefiles is not necessary, since CartoDB can do it for you! So we only need the original [NUTS regions shp file][download regions] and some sample data. We will use again the povertry rate, [learn how to download it][previous post]. The CSV header must be changed to:

  GEO,GEO(L)/TIME,rate_2010,rate_2011,rate_2012,rate_2013,rate_2014

If the fields are a number, CartoDB will take the header as data and you will have to remove it later and put names to the columns. It's better to do it before.

The shapefile must be in a zip file, since a Shapefile is a set of at least three files, and you can oly upload one at once.

Uploading the data
------------------

Once you have both files, *nuts_rg_01m_2013.zip* and *povertry_rate.csv*, upload them into CartoDB:

* Login to CartoDB (or create an account. I did it directly with my Google account)
* At the main Dashboard, select *Your datasets* next to your user name at the top left side. Now, you will have something like this:

<img src="{{ site.baseurl }}/images/other/eurostat-cartodb/upload.png"/>



Links
-----
[Mapping EUROSTAT data with D3js][previous post]


[previous post]: ../d3/2015/09/25/d3-creating-EUROSTAT-maps.html
[download regions]: http://ec.europa.eu/eurostat/web/gisco/geodata/reference-data/administrative-units-statistical-units
