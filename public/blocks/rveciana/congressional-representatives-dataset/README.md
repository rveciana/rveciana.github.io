Based on [this data](https://github.com/bradoyler/atlas-make/tree/master/us-congress), contains a [Shapefile](us_congressional_districts.zip) and two topojson with the US congressional Districts. 

The *[atlas-make](https://github.com/bradoyler/atlas-make)* project has a better maintained version of this data.

The difference from the data is based on, is that the American Samoa, Guam and Northern Marianas are included from the [Natural Earth dataset](http://www.naturalearthdata.com/). The Congress Representative data is included too.

get_areas.py is a script to calculate the area paoperties for the new objects. The name of the Congressional Representatives in the added territories has been taken from the Wikipedia.

The topojson has been calculated using the command:
    topojson -o us_congressional_district.json cgd114p010g.shp -p
    
The topojson data can be used with d3 and the [d3-composite-projections library](http://geoexamples.com/d3-composite-projections/), as seen in the example.
