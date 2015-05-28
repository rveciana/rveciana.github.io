---
layout: post
title:  "Creating files with OGR, GDAL and python"
date:   2012-01-03
categories: python
tags: [OGR, GDAL]
---
Although  the way to create files is quite well documented in the official gdal tutorials, it's quite useful to have it summarized.

Creating a GDAL file
--------------------

To create a raster file using GDAL is possible to use different techniques. The simplest is to use the Create statement.

{% highlight python %}
from osgeo import gdal
from osgeo import osr
from osgeo.gdalconst import *
driver = gdal.GetDriverByName( 'GTiff' )
ds = driver.Create( 'out_file.tiff', 255, 255, 1, gdal.GDT_Int32)
proj = osr.SpatialReference()
proj.SetWellKnownGeogCS( "EPSG:4326" )
ds.SetProjection(proj.ExportToWkt())
geotransform = (1,0.1,0,40,0,0.1)
ds.SetGeoTransform(geotransform)
ds = None
{% endhighlight %}

* The three first lines are the library imports.
* First, a Driver must be declared. This determines the format of the created file.
    * The official GDAL page has the complete supported formats list. Look if the creation option is 'YES'
* The second step is to create the datasource.
    * The first parameter is the output file name.
    * The next two are the raster dimensions.
    * Then, the number of layers.
    * The last parameter is the data type of the raster.
* The next steps configure the projection and are optional, but highly recommended. The easiest way to declare a projection, in my opinion, is to use the EPSG code.
* The geotransform defines the relation between the raster coordinates x, y and the geographic coordinates, using the following definition:

    Xgeo = geotransform[0] + Xpixel*geotransform[1] + Yline*geotransform[2]
    Ygeo = geotransform[3] + Xpixel*geotransform[4] + Yline*geotransform[5]

* The first and fourth parameters define the origin of the upper left pixel
* The second and sixth parameters define the pixels size
* The third and fifth parameters define the rotation of the raster.
* After doing all the operations, is a good practice to set the datasource as None to close it properly.

Creating an OGR file
--------------------

Creating a vector file is as easy as creating a raster:

{% highlight python %}
from osgeo import ogr
from osgeo import osr
drv = ogr.GetDriverByName( 'ESRI Shapefile ' )
dst_ds = drv.CreateDataSource( 'out_file.shp' )
proj = osr.SpatialReference()
proj.SetWellKnownGeogCS( "EPSG:4326" )
dst_layer = dst_ds.CreateLayer('TOWNS', srs = proj )
dst_ds = None
{% endhighlight %}

* After the imports, we declare de Driver, choosing the format from the official list (be careful to use a format with the creation option set to YES).
* To create the datasource, only the output file name is needed. Sometimes it will fail if an other file with the same name already exists, so it's better to check it before executing this statement.
* Is good, but not mandatory, to set the projection information.
    * As in the raster case, the easiest way is from the EPSG code.
    * The projection is set to each layer with the CreateLayer method.
* After doing all the operations, is a good practice to set the datasource as None to close it properly.

Creating temporary memory files
-------------------------------

Sometimes is useful to have a file in memory. If you want to import some vector data and analyze it with the ogr functions, you may not want to create the actual file. This can be done in a raster file with GDAL or a vector file in OGR.

When using GDAL, the Driver name must be declared as 'MEM', and the data source must be created with a null name , using ''. The example creates a 255x255 raster with integer values:

    driver = gdal.GetDriverByName( 'MEM' )
    ds = driver.Create( '', 255, 255, 1, gdal.GDT_Int32)


In OGR, you must declare the Driver used as 'Memory', and when creating the Datasource, use the name 'out':

    drv = ogr.GetDriverByName( 'Memory' )
    dst_ds = drv.CreateDataSource( 'out' )
