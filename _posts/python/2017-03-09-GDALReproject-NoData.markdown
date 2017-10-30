---
layout: post
title:  "Shortest distance to a geometry in a specified direction using Python"
date:   2014-08-16
categories: python
tags: [GDAL, projections, raster]
teaser: shortest-distance-to-geometry.png
description: The API for gdalwarp in Python using NoData values
thumbnail: /images/d3/d3-shaded-relief/twitter.png
twitter-card: summary
---


from osgeo import gdal
from osgeo import osr

driver = gdal.GetDriverByName('GTiff')

ds_in = gdal.Open('/DADES/MODELS/PRESCAT/2017/01/01/PRESCAT-2017010100_0.tiff')

proj_in = ds_in.GetProjection()

ds_out = driver.Create('/tmp/out.tiff', 675, 655,
                        4, gdal.GDT_Float32)

ds_out.SetGeoTransform([260000, 400, 0, 4750000, 0, -400])

proj_out = osr.SpatialReference()
proj_out.ImportFromEPSG(25831)
proj_out = proj_out.ExportToWkt()

ds_out.SetProjection(proj_out)

method = gdal.GRA_Cubic

gdal.ReprojectImage(ds_in, ds_out,
    proj_in, proj_out,
    method)


//////////////////


from osgeo import gdal
from osgeo import osr

driver = gdal.GetDriverByName('GTiff')

ds_in = gdal.Open('/DADES/MODELS/PRESCAT/2017/01/01/PRESCAT-2017010100_0.tiff')

proj_in = ds_in.GetProjection()

proj_out = osr.SpatialReference()
proj_out.ImportFromEPSG(25831)
proj_out = proj_out.ExportToWkt()

reproj_file = gdal.AutoCreateWarpedVRT( ds_in, ds_in.GetProjection(), proj_out )

driver = gdal.GetDriverByName("GTiff")
dest_file = driver.CreateCopy("/tmp/t.tiff", reproj_file, 0)

/////VRT////  -->     <Option name="INIT_DEST">0</Option>

<VRTDataset rasterXSize="80" rasterYSize="74" subClass="VRTWarpedDataset">
  <SRS>PROJCS["ETRS89 / UTM zone 31N",GEOGCS["ETRS89",DATUM["European_Terrestrial_Reference_System_1989",SPHEROID["GRS 1980",6378137,298.257222101,AUTHORITY["EPSG","7019"]],TOWGS84[0,0,0,0,0,0,0],AUTHORITY["EPSG","6258"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4258"]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",3],PARAMETER["scale_factor",0.9996],PARAMETER["false_easting",500000],PARAMETER["false_northing",0],UNIT["metre",1,AUTHORITY["EPSG","9001"]],AXIS["Easting",EAST],AXIS["Northing",NORTH],AUTHORITY["EPSG","25831"]]</SRS>
  <GeoTransform>  2.4390661575654868e+05,  3.7262015453620070e+03,  0.0000000000000000e+00,  4.7562398508180482e+06,  0.0000000000000000e+00, -3.7262015453620070e+03</GeoTransform>
  <VRTRasterBand dataType="Float32" band="1" subClass="VRTWarpedRasterBand">
    <Metadata>
      <MDI key="GRIB_ELEMENT">PRECIPITACIO</MDI>
      <MDI key="GRIB_REF_TIME">1483228800</MDI>
      <MDI key="GRIB_SHORT_NAME">SFC</MDI>
      <MDI key="GRIB_UNIT">%</MDI>
      <MDI key="GRIB_VALID_TIME">1483228800</MDI>
      <MDI key="STATISTICS_MAXIMUM">14,285714149475</MDI>
      <MDI key="STATISTICS_MEAN">2,1959420650101</MDI>
      <MDI key="STATISTICS_MINIMUM">0</MDI>
      <MDI key="STATISTICS_STDDEV">3,4693737669996</MDI>
    </Metadata>
    <NoDataValue>-9.99000000000000E+02</NoDataValue>
    <ColorInterp>Red</ColorInterp>
    <Histograms>
      <HistItem>
        <HistMin>-0,007142857074737548</HistMin>
        <HistMax>14,29285700654984</HistMax>
        <BucketCount>1000</BucketCount>
        <IncludeOutOfRange>0</IncludeOutOfRange>
        <Approximate>0</Approximate>
        <HistCounts>1861|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|6|0|0|0|0|0|0|0|0|0|0|0|0|0|156|0|0|0|0|0|0|0|0|0|0|0|0|0|0|578|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|1|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|34|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|136|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|26|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|57</HistCounts>
      </HistItem>
    </Histograms>
  </VRTRasterBand>
  <VRTRasterBand dataType="Float32" band="2" subClass="VRTWarpedRasterBand">
    <Metadata>
      <MDI key="GRIB_ELEMENT">TMAX</MDI>
      <MDI key="GRIB_REF_TIME">1483228800</MDI>
      <MDI key="GRIB_SHORT_NAME">SFC</MDI>
      <MDI key="GRIB_UNIT">C</MDI>
      <MDI key="GRIB_VALID_TIME">1483228800</MDI>
      <MDI key="STATISTICS_MAXIMUM">18,936731338501</MDI>
      <MDI key="STATISTICS_MEAN">10,682648704348</MDI>
      <MDI key="STATISTICS_MINIMUM">0</MDI>
      <MDI key="STATISTICS_STDDEV">3,6697751457734</MDI>
    </Metadata>
    <NoDataValue>-9.99000000000000E+02</NoDataValue>
    <ColorInterp>Green</ColorInterp>
    <Histograms>
      <HistItem>
        <HistMin>-0,009468365669250488</HistMin>
        <HistMax>18,94619970417023</HistMax>
        <BucketCount>1000</BucketCount>
        <IncludeOutOfRange>0</IncludeOutOfRange>
        <Approximate>0</Approximate>
        <HistCounts>180|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|2|0|0|0|0|0|1|0|0|0|0|1|0|0|0|0|0|0|0|2|3|0|0|0|3|0|0|0|0|0|0|0|0|0|2|0|0|0|0|0|3|0|0|1|1|0|0|2|0|0|1|0|0|0|1|2|0|1|1|1|1|0|2|2|2|1|2|0|2|2|0|0|0|0|1|1|0|0|1|1|1|0|1|0|1|3|0|0|0|2|0|2|3|1|3|0|0|2|2|1|0|1|3|1|3|3|4|6|3|1|8|12|2|6|9|7|5|9|11|1|6|13|5|7|2|7|10|8|10|4|5|14|5|6|15|10|10|7|9|10|11|12|12|13|16|9|9|14|9|8|5|17|12|11|17|10|15|13|9|11|12|10|10|5|12|16|5|9|11|14|10|9|11|10|13|6|7|7|12|8|9|13|10|6|4|11|12|9|7|8|17|8|12|7|9|9|5|10|7|13|7|12|5|10|7|9|2|3|10|9|6|11|5|6|5|9|6|8|9|9|5|9|3|6|8|4|6|7|13|7|3|11|5|3|3|4|2|6|6|2|7|7|7|9|3|5|14|5|6|6|5|7|4|10|7|3|7|6|4|3|1|5|4|2|7|0|5|4|5|2|5|6|2|1|4|3|5|3|2|0|1|3|2|5|5|5|6|4|4|4|4|4|3|3|2|2|4|1|3|1|4|6|5|5|6|4|4|1|6|6|1|3|3|3|3|1|7|4|7|3|3|10|4|5|6|4|1|3|4|4|9|3|7|2|2|7|8|2|3|3|4|5|9|2|7|3|5|7|6|9|7|3|5|6|5|1|4|4|7|5|8|4|1|2|2|5|6|7|6|6|6|5|6|7|5|5|8|3|6|6|6|3|9|1|6|10|4|7|4|8|9|6|1|8|5|9|5|1|12|6|6|9|5|7|10|6|5|4|8|6|12|6|6|13|9|14|7|1|5|9|7|2|4|7|4|8|10|10|3|5|6|6|6|4|7|6|6|3|4|2|8|4|7|5|5|4|5|12|4|5|7|6|6|7|6|5|5|6|5|7|10|10|13|9|9|7|6|13|3|12|4|5|8|9|1|3|3|8|2|8|4|4|9|6|4|6|6|2|9|5|6|3|1|6|3|1|5|2|3|6|2|0|8|1|1|0|2|6|3|0|8|4|3|3|3|3|0|2|2|5|1|2|0|0|0|3|0|0|0|2|2|0|0|1|1|2|0|0|1|0|3|1|0|0|0|1|2|0|0|1|1|0|0|0|1|0|2|0|1|0|0|0|1|0|0|0|0|2|0|2|0|1|0|0|0|1|1|0|1|0|0|3|0|0|0|0|0|0|1|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|1|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|1|0|0|0|0|0|0|0|3|0|0|0|0|0|0|0|0|0|0|1|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|1</HistCounts>
      </HistItem>
    </Histograms>
  </VRTRasterBand>
  <VRTRasterBand dataType="Float32" band="3" subClass="VRTWarpedRasterBand">
    <Metadata>
      <MDI key="GRIB_ELEMENT">TMIN</MDI>
      <MDI key="GRIB_REF_TIME">1483228800</MDI>
      <MDI key="GRIB_SHORT_NAME">SFC</MDI>
      <MDI key="GRIB_UNIT">C</MDI>
      <MDI key="GRIB_VALID_TIME">1483228800</MDI>
      <MDI key="STATISTICS_MAXIMUM">9,4128904342651</MDI>
      <MDI key="STATISTICS_MEAN">-0,14479932243621</MDI>
      <MDI key="STATISTICS_MINIMUM">-5,2890510559082</MDI>
      <MDI key="STATISTICS_STDDEV">2,6801332980903</MDI>
    </Metadata>
    <NoDataValue>-9.99000000000000E+02</NoDataValue>
    <ColorInterp>Blue</ColorInterp>
    <Histograms>
      <HistItem>
        <HistMin>-5,29640202665329</HistMin>
        <HistMax>9,420241405010223</HistMax>
        <BucketCount>1000</BucketCount>
        <IncludeOutOfRange>0</IncludeOutOfRange>
        <Approximate>0</Approximate>
        <HistCounts>2|1|0|0|0|0|0|0|1|2|0|1|0|1|0|1|0|2|1|1|4|2|1|4|2|0|7|1|1|2|2|0|2|1|1|0|3|1|3|1|1|4|2|2|0|6|2|0|4|2|0|2|4|5|1|3|9|4|6|3|5|7|5|2|6|5|4|6|2|1|5|2|9|2|4|2|3|4|6|6|2|2|8|5|2|3|1|5|3|0|3|4|6|6|2|4|5|4|3|8|4|2|4|3|6|5|6|5|2|4|2|2|5|2|5|3|7|3|4|6|2|1|2|3|5|7|6|4|2|3|5|2|8|4|4|7|4|5|1|5|10|5|2|2|9|3|5|2|4|0|3|7|2|3|3|3|5|8|10|9|5|7|4|5|9|1|3|2|4|7|6|4|2|7|1|4|4|6|3|1|7|5|4|1|5|3|2|5|1|1|3|3|5|6|3|9|3|4|2|4|4|2|1|2|2|6|5|2|1|4|7|3|3|7|5|1|1|4|6|0|1|3|3|2|4|1|8|7|1|4|4|4|2|2|5|4|5|4|5|2|5|3|3|4|3|2|8|7|4|3|3|5|1|5|3|5|8|1|8|5|3|0|2|9|3|3|3|3|6|2|6|4|7|6|5|4|8|3|1|2|8|5|1|4|5|4|10|10|3|2|3|4|7|8|5|7|5|5|5|9|6|11|8|4|8|7|6|8|6|3|7|9|5|4|5|5|9|4|3|3|8|7|6|4|5|8|3|7|4|7|6|11|3|8|6|12|5|7|10|10|8|7|3|7|4|6|10|5|6|5|8|6|7|7|2|6|6|3|5|186|5|4|6|3|5|7|1|9|9|5|4|8|1|4|5|7|1|6|4|3|4|0|4|9|3|2|8|5|9|6|5|3|4|3|1|4|1|9|5|3|6|5|0|6|5|2|4|4|2|3|6|2|5|9|3|3|2|3|0|3|6|5|2|4|4|1|5|6|2|0|7|5|3|3|5|2|3|8|4|7|1|10|2|3|2|3|2|5|4|6|6|6|2|4|3|7|3|2|4|2|5|0|3|5|3|4|5|4|5|1|7|6|3|4|10|5|1|2|4|3|6|3|3|3|3|5|6|5|9|6|5|1|6|12|4|1|5|6|2|2|5|3|3|4|6|2|4|2|0|2|5|1|3|2|6|5|5|2|4|4|2|3|4|2|2|3|3|2|6|4|0|5|6|2|1|4|1|1|3|3|1|5|0|2|4|3|3|3|10|1|0|4|9|4|0|3|2|7|0|4|0|0|6|0|3|2|3|7|3|2|3|1|0|1|7|4|4|2|1|3|1|2|5|3|1|1|1|1|7|3|7|3|0|2|6|5|5|1|0|4|3|0|5|2|0|0|5|3|6|6|7|1|2|5|3|3|5|4|4|5|1|0|2|1|0|2|2|1|3|2|5|0|1|1|2|3|3|3|3|2|2|2|1|3|2|0|2|2|0|2|2|5|3|1|1|0|2|1|2|2|0|5|1|3|0|3|1|3|4|4|0|2|0|1|5|1|1|1|3|2|2|6|0|4|0|0|0|0|0|0|1|4|2|2|1|2|2|0|3|2|0|1|0|3|3|5|2|3|0|2|2|3|1|2|1|0|2|3|1|0|0|1|1|3|2|0|3|2|1|0|1|1|0|2|0|1|2|0|0|0|0|1|2|0|0|0|2|4|0|0|0|2|1|1|0|1|0|1|2|0|1|1|1|0|0|0|0|0|0|0|0|0|0|1|2|0|0|1|0|1|2|0|0|0|0|0|1|0|0|0|0|0|1|0|0|0|0|0|0|0|0|1|2|0|0|0|1|0|1|0|0|0|1|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|1|0|1|0|0|0|0|0|0|0|0|0|0|0|1|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|1|1|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|1|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|1</HistCounts>
      </HistItem>
    </Histograms>
  </VRTRasterBand>
  <VRTRasterBand dataType="Float32" band="4" subClass="VRTWarpedRasterBand">
    <Metadata>
      <MDI key="GRIB_ELEMENT">ESTATCEL</MDI>
      <MDI key="GRIB_REF_TIME">1483228800</MDI>
      <MDI key="GRIB_SHORT_NAME">SFC</MDI>
      <MDI key="GRIB_UNIT">--</MDI>
      <MDI key="GRIB_VALID_TIME">1483228800</MDI>
      <MDI key="STATISTICS_MAXIMUM">3</MDI>
      <MDI key="STATISTICS_MEAN">1,2654991243433</MDI>
      <MDI key="STATISTICS_MINIMUM">0</MDI>
      <MDI key="STATISTICS_STDDEV">0,80600888335785</MDI>
    </Metadata>
    <NoDataValue>-9.99000000000000E+02</NoDataValue>
  </VRTRasterBand>
  <BlockXSize>80</BlockXSize>
  <BlockYSize>74</BlockYSize>
  <GDALWarpOptions>
    <WarpMemoryLimit>6.71089e+07</WarpMemoryLimit>
    <ResampleAlg>NearestNeighbour</ResampleAlg>
    <WorkingDataType>Float32</WorkingDataType>
    <Option name="INIT_DEST">0</Option>
    <Option name="UNIFIED_SRC_NODATA">YES</Option>
    <Option name="EXTRA_ELTS">1</Option>
    <Option name="EXTRA_ELTS">1</Option>
    <SourceDataset relativeToVRT="0">/DADES/MODELS/PRESCAT/2017/01/01/PRESCAT-2017010100_0.tiff</SourceDataset>
    <Transformer>
      <GenImgProjTransformer>
        <SrcGeoTransform>-0.0199999511241912842,0.0399999991059303284,0,42.9200007356703281,0,-0.0399999991059303284</SrcGeoTransform>
        <SrcInvGeoTransform>0.49999878928062591,25.000000558793559,0,1073.00004237517805,0,-25.000000558793559</SrcInvGeoTransform>
        <DstGeoTransform>243906.615756548679,3726.20154536200698,0,4756239.85081804823,0,-3726.20154536200698</DstGeoTransform>
        <DstInvGeoTransform>-65.4571720792018255,0.000268369809798586279,0,1276.4311841204958,0,-0.000268369809798586279</DstInvGeoTransform>
        <ReprojectTransformer>
          <ReprojectionTransformer>
            <SourceSRS>GEOGCS["ED50",DATUM["European_Datum_1950",SPHEROID["International 1924",6378388,297.000000000005,AUTHORITY["EPSG","7022"]],AUTHORITY["EPSG","6230"]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433],AUTHORITY["EPSG","4230"],EXTENSION["CENTER_LONG",1.74]]</SourceSRS>
            <TargetSRS>PROJCS["ETRS89 / UTM zone 31N",GEOGCS["ETRS89",DATUM["European_Terrestrial_Reference_System_1989",SPHEROID["GRS 1980",6378137,298.257222101,AUTHORITY["EPSG","7019"]],TOWGS84[0,0,0,0,0,0,0],AUTHORITY["EPSG","6258"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4258"]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",3],PARAMETER["scale_factor",0.9996],PARAMETER["false_easting",500000],PARAMETER["false_northing",0],UNIT["metre",1,AUTHORITY["EPSG","9001"]],AXIS["Easting",EAST],AXIS["Northing",NORTH],AUTHORITY["EPSG","25831"]]</TargetSRS>
          </ReprojectionTransformer>
        </ReprojectTransformer>
      </GenImgProjTransformer>
    </Transformer>
    <BandList>
      <BandMapping src="1" dst="1">
        <SrcNoDataReal>-999</SrcNoDataReal>
        <SrcNoDataImag>0</SrcNoDataImag>
        <DstNoDataReal>-999</DstNoDataReal>
        <DstNoDataImag>0</DstNoDataImag>
      </BandMapping>
      <BandMapping src="2" dst="2">
        <SrcNoDataReal>0</SrcNoDataReal>
        <SrcNoDataImag>0</SrcNoDataImag>
        <DstNoDataReal>0</DstNoDataReal>
        <DstNoDataImag>0</DstNoDataImag>
      </BandMapping>
      <BandMapping src="3" dst="3">
        <SrcNoDataReal>0</SrcNoDataReal>
        <SrcNoDataImag>0</SrcNoDataImag>
        <DstNoDataReal>0</DstNoDataReal>
        <DstNoDataImag>0</DstNoDataImag>
      </BandMapping>
      <BandMapping src="4" dst="4">
        <SrcNoDataReal>0</SrcNoDataReal>
        <SrcNoDataImag>0</SrcNoDataImag>
        <DstNoDataReal>0</DstNoDataReal>
        <DstNoDataImag>0</DstNoDataImag>
      </BandMapping>
    </BandList>
  </GDALWarpOptions>
</VRTDataset>

------

./gdalwarp --config GDAL_DATA "../data/" -t_srs "EPSG:25831" /DADES/MODELS/PRESCAT/2017/01/01/PRESCAT-2017010100_0.tiff /tmp/l.tiff

./configure
make
cd swig/python
python setup install

LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/tmp/gdal-2.1.0/.libs:/usr/lib64
export LD_LIBRARY_PATH
GDAL_DATA=/tmp/gdal-2.1.0/data
export GDAL_DATA
-------


Links
-----

http://www.gdal.org/warptut.html
http://www.gdal.org/gdal_tutorial.html

https://github.com/rouault/gdal2/blob/trunk/gdal/swig/python/scripts/gdal2tiles.py

http://gis.stackexchange.com/questions/143966/why-is-gdalwarp-changing-value-in-nodata-pixels
http://trac.osgeo.org/gdal/ticket/5675

https://gist.github.com/cspanring/5680334

Install gdal 2.1.0
