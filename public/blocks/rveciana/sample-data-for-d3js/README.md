Example files for the [blog](www.geoexamples.org) (and [bl.ocks.org](http://bl.ocks.org/rveciana)) examples.

comarques.topo.json
-------------
This file in TopoJSON format contains the Catalan regions known as [*comarques*](http://en.wikipedia.org/wiki/Comarca), similar to counties.
The data is taken from the [vissir3 tool](http://www.icc.cat/vissir3/) from the [ICC](http://www.icc.cat).
Going to *Catàleg i descàrrega* --> *Base municipal 1:1.000.000*

To get the file:

* unzip bm1000mv33sh1fc1r170.zip

* ogr2ogr -t_srs EPSG:4326 comarques.shp bm1000mv33sh1fpc1r170.shp

* topojson -o comarques.topo.json -p comarca=COMARCA comarques.shp

comarques.csv
-------------
Some data for each comarca. When combined with the file above, it's possible to generate different maps.
The data is taken from [IDESCAT](http://www.idescat.cat/en/).

encuesta.csv
------------
Some elections opinion polling results. The data is the one for the 2015 General Election, made by GAD3 the 9-13th of January 2014. Taken [from the Spanish Wikipedia](http://es.wikipedia.org/wiki/Anexo:Sondeos_de_intenci%C3%B3n_de_voto_para_las_elecciones_generales_de_Espa%C3%B1a_de_2015)

nuts*.json
----------
The NUTS regions from Eurostast. Only one level (0 to 3) for each file, so much smaller files are got. The population for each region is added so the Eurostat values can be represented by inhabitants instead of absolute values (i.e. hotel beds/10000 people instead of hotel beds).

The regions shapes source: http://ec.europa.eu/eurostat/web/gisco/geodata/reference-data/administrative-units-statistical-units
The population data source: http://appsso.eurostat.ec.europa.eu/nui/show.do?dataset=demo_r_pjanaggr3&lang=en

resultados.json
---------------
The Spanish 2011 General Election results (seats) for all the provinces. [Taken from the Spanish Wikipedia.](http://es.wikipedia.org/wiki/Elecciones_generales_de_Espa%C3%B1a_de_2011#Diputados_por_circunscripciones)

regions.json
-------------
This file contains the NUTS European regions, taken from the [EUROSTAT web site](http://epp.eurostat.ec.europa.eu/portal/page/portal/gisco_Geographical_information_maps/popups/references/administrative_units_statistical_units_1)(file  NUTS_2010_10M_SH.zip), but adding the population and name for every region, so the statistical data can be later shown related to the population density. To do it, the shapefile file has been joined with the [NUTS_2010.csv file](http://ec.europa.eu/eurostat/ramon/documents/nuts/NUTS_2010.zip).

The shapefile has been also simplified when translated to topojson, using the flag --simplify-proportion 0.1, so it's lighter to use with the examples.

To get more details about the creation of this file, see [this blog entry](http://geoexamples.blogspot.com/2013/10/using-eurostats-data-with-d3js.html).

provincias.json
---------------
This file contains the Spanish provinces in the TopoJSON format. The original data was a ShapeFile taken from [geocommons.com](http://geocommons.com/overlays/168393).

To convert the file to the TopoJSON I used the topojson command as follows, after renaming the file to provincias.shp:

    topojson -p nombre,idprov --shapefile-encoding utf-8 -o provincias.json provincias_españa.shp

The licence for the provincias.json file is the Creative Commons Attribution 3.0 License.

france.json
-----------

A topojson of the French regions taken from NaturalEarth. For testing the [d3-composite-projections project](https://github.com/rveciana/d3-composite-projections).

japan.json
-----------

A topojson of the Japanese islands taken from NaturalEarth. For testing the [d3-composite-projections project](https://github.com/rveciana/d3-composite-projections).

The commands to create it were:

    ogr2ogr -where 'admin = "Japan"' japan.shp ne_10m_admin_1_states_provinces.shp

    topojson -p region,code=region_cod -o japan.json japan.shp

ecuador.json
-----------

A topojson of Ecuador taken from NaturalEarth. For testing the [d3-composite-projections project](https://github.com/rveciana/d3-composite-projections).

The commands to create it were:

    ogr2ogr -where 'admin = "Ecuador"' ecuador.shp ne_10m_admin_1_states_provinces.shp

    topojson -p region,code=region_cod -o ecuador.json ecuador.shp

chile.json
----------

A topojson of Chile with data taken from NaturalEarth. The [Chilean Antarctic Territory](https://en.wikipedia.org/wiki/Chilean_Antarctic_Territory) is included so all the electoral maps can be done. The transverseMercatorChile projection from the [d3-composite-projections project](https://github.com/rveciana/d3-composite-projections) also includes this Antarctic territory, so this file is a good source to test it.

The commands to create it were:

    ogr2ogr -where 'admin = "Chile"' ecuador.shp ne_10m_admin_1_states_provinces.shp

    ogr2ogr -clipsrc -53 -90 -90 -60 -where 'admin = "Antarctica"' antarctica.shp ne_10m_admin_1_states_provinces.shp
    
    ogr2ogr -update -append chile.shp antarctica.shp -nln chile

Then, [QGIS](http://www.qgis.org/en/site/) was used to merge the Antarctic Territory with the Magallanes Region, since it depends on it. To do it the [merge selected features](http://docs.qgis.org/2.2/en/docs/user_manual/working_with_vector/editing_geometry_attributes.html?highlight=merge#merge-selected-features) tool was used.

    topojson -p region,code=region=name,code=diss_me -o chile.json chile.shp