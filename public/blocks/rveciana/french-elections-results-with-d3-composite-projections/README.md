2017 french presidential elections results
------------------------------------------

The map shows the first and second round results for the presidential elections in france. When the mouse pointer is over a department, the results for it appear in a tooltip. At the moment of the creation, only the first round was done, and the second round data will be added this Sunday after the results are published.

The map is created using the geoConicConformalFrance projection of the [d3-composite-projections](http://geoexamples.com/d3-composite-projections/) library.

Creating the TopoJSON file with all the French territoires
----------------------------------------------------------

Downloaded the [data from Natural Earth](http://www.naturalearthdata.com/downloads/10m-cultural-vectors/)(countries file) and run:

    ogr2ogr -where "adm0_a3 = 'FRA' OR adm0_a3 = 'SPM' OR adm0_a3 = 'BLM' OR adm0_a3 = 'PYF' OR adm0_a3 = 'NCL' OR adm0_a3 = 'WLF'" france.shp ne_10m_admin_1_states_provinces.shp

    shp2json france.shp > /tmp/france/france.geojson

    geo2topo france.geojson > france.json

If you want a lighter file, run:

    toposimplify -p 0.001 -f < france.json  > france_simplidfied.json


###Edit names and regions:

The output file has some errors and different names that make the results file not matching all the departments:

    Guyane française --> Guyane
    Saint Berthélemy --> Saint-Martin/Saint-Barthélemy   ->>Some problems utf8 edit the json
    Haute-Rhin --> Haut-Rhin
    Seien-et-Marne --> Seine-et-Marne
    Meurhe-et-Moselle --> Meurthe-et-Moselle

    Merge Saint-Pierre-et-Miquelon
    Wallis-et-Futuna
    Nouvelle Calédonie
    Polynésie française

    etc.

Getting the elections result
----------------------------

The results are downloaded from the French Wikipedia:

https://fr.wikipedia.org/wiki/R%C3%A9sultats_par_d%C3%A9partement_de_l%27%C3%A9lection_pr%C3%A9sidentielle_fran%C3%A7aise_de_2017

The script *extract.py* uses [BeautifulSoup](https://www.crummy.com/software/BeautifulSoup/bs4/doc/) to transform the wikipedia tables into a nice json file readable by d3. It's written in python 2.7
