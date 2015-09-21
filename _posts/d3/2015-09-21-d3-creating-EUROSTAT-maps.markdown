---
layout: post
title:  "Mapping EUROSTAT data with D3js"
date:   2015-09-21
categories: d3
tags: [EUROSTAT, Open Data]
teaser: d3-nuts.png
---

Eurostat gives a lot of statistical data, most of the times georeferred. This makes easy to create nive maps telling stories about any topic you may be interested in.

Unfortunately, I didn't find an easy way to do that using D3js, so I wrote [a post some time ago on how to do it][original post]. The idea worked, but I think that it can be done really easily, without python scripts, just by downloading Excel sheets and exporting to CSV. Also, with the new [d3-composite-projections][d3-composite-projections] version, a convenient projection has been added to show the island and terrotories away from Europe, but that appear at the Eurostat data.

The idea is creating the maps as [Eurostat does][example map]:

<a href="http://ec.europa.eu/eurostat/statistics-explained/images/a/ae/Urban_rural_typology_for_NUTS3_new.png"><img width="50%" src="{{ site.baseurl }}/images/d3/d3-nuts/example.png"/></a>



Downloading some sample data
----------------------------

To create a map, you will need two data sources:

1. The regions where the data belongs. The regions are coded in a system called NUTS (Nomenclature of territorial units for statistics)
2. The data you want to represent at each region, such as *Greenhouse gas emisions*, *murders*, etc

### NUTS regions

Getting the regions and using them in TopoJSON format is not very straigth forward, so I did it for you.

The files are at [this gist][https://gist.github.com/rveciana/5919944], with the names nuts0.json, nuts1.json, etc. You can use *rawgit* to get the files without downloading them. To get the nuts3 topojson:

    https://cdn.rawgit.com/rveciana/5919944/raw/19dc3e37a6ca5ebb05d3a2d96a1f499d6cc3411c/nuts3.json

If you want to know how to generate these TopoJSONs, you can check [the next post][topojson tutorial]

### Getting the information data

To get the data, you have first to decide which data to use. In my case, I have chosen to map the amount of people at risk of poverty or social exclusion. To do it, [from the main page][eurostat], I have done:

Population and Social conditions -> Income and living conditions -> Main Tables -> People at risk of poverty or social exclusion by NUTS 2 regions.

From there, choose *Tables, maps and graphs interface*:

<img src="{{ site.baseurl }}/images/d3/d3-nuts/table.png"/>

Choose the *More data in the source dataset* button:

<img src="{{ site.baseurl }}/images/d3/d3-nuts/source-dataset.png"/>

Then, the GEO *+ button*:

<img src="{{ site.baseurl }}/images/d3/d3-nuts/geo.png"/>

Once there, ask to get not just the region names, but the labels too, so the topoJSON codes can be used. Don't forget to click the *update* button:

<img src="{{ site.baseurl }}/images/d3/d3-nuts/labels.png"/>

Now you can click the *download* button and ask to have the labels in a separate column from the name (or doing it yourself will be a mess, believe me):

<img src="{{ site.baseurl }}/images/d3/d3-nuts/download.png"/>

Oce the excel file is generated, export it to CSV. In our case, two tables are generated. I have chosen the first one *percentage of total population*, and remove the other parts.

Why not generating CSV files directly if there is an option? Because it will generate a row for each year and region, making things much more difficult.

Creating the map
----------------



[original post]: [http://geoexamples.blogspot.com.es/2013/10/using-eurostats-data-with-d3js.html]
[d3-composite-projections]: [http://geoexamples.com/d3-composite-projections/]
[example map]: http://ec.europa.eu/eurostat/statistics-explained/images/a/ae/Urban_rural_typology_for_NUTS3_new.png
[gist]: https://gist.github.com/rveciana/5919944
[topojson tutorial]: d3-EUROSTAT-topojson.html
[eurostat]: http://ec.europa.eu/eurostat
