---
layout: ../../layouts/Post.astro
title: "SRTM data download"
pubDate: 2019-01-19
teaser: srtm-download.png
categories: other
tags: [SRTM]
thumbnail: /images/other/complex-gis-calculations-gpu/twitter.png
twitter-card: summary
description: Download and merge SRTM data to create a DEM
---

The [SRTM mission][1] gives a global coverage web data. It's not easy to download it, although certain web sites give tools to do it. One of them, [the SRTM 90m DEM Digital Elevation Database][2], allows to do it in 5x5 degrees tiles.

I made this script to download an arbitrary region that can be re-projected.

## Complete code

```python

#!/usr/bin/env python
'''Creates a DEM file downloading the SRTM data and clipping it to the
specified bounding box
'''
import argparse
import zipfile
from io import BytesIO
from math import ceil, floor
from os.path import exists

import gdal
import numpy
import osr
import urllib3

def dem_creator(out_file, epsg, bbox, res):

    latlon = osr.SpatialReference()
    latlon.ImportFromEPSG(4326)

    usr_srs = osr.SpatialReference()
    usr_srs.ImportFromEPSG(epsg)

    transf = osr.CoordinateTransformation(usr_srs, latlon)

    lon0, lat1, _ = transf.TransformPoint(bbox[0], bbox[1])
    lon1, lat0, _ = transf.TransformPoint(bbox[2], bbox[3])

    tile_x0 = 1 + floor((lon0 + 180) / 5)
    tile_x1 = 1 + ceil((lon1 + 180) / 5)

    tile_y0 = 1 + floor((60 - lat0) / 5)
    tile_y1 = 1 + ceil((60 - lat1) / 5)

    out_data = numpy.empty((6001 * (tile_y1 - tile_y0),
                           6001 * (tile_x1 - tile_x0)))
    pos_x = 0
    pos_y = 0
    for i in range(tile_x0, tile_x1):
        for j in range(tile_y0, tile_y1):
            data = get_data(i, j)
            out_data[6001 * pos_y:6001 * pos_y + 6001,
                     6001 * pos_x:6001 * pos_x + 6001] = data
            pos_y += 1
        pos_x += 1

    driver = gdal.GetDriverByName('MEM')
    d_s = driver.Create('', 6001 * (tile_x1 - tile_x0),
                        6001 * (tile_y1 - tile_y0), 1, gdal.GDT_Int32)
    d_s.GetRasterBand(1).WriteArray(out_data)
    d_s.SetGeoTransform((-180 + 5*(tile_x0-1), 0.000833333333333, 0,
                         60 - 5*(tile_y0 - 1), 0, -0.000833333333333))

    srs = osr.SpatialReference()
    srs.ImportFromEPSG(4326)
    d_s.SetProjection(srs.ExportToWkt())
    d_s.GetRasterBand(1).SetNoDataValue(-32768)

    gdal.Warp(out_file, d_s, format='GTIFF', dstSRS='EPSG:{}'.format(epsg),
              outputBounds=bbox,
              xRes=res[0], yRes=res[1])

def get*data(i, j):
url = "http://srtm.csi.cgiar.org/wp-content/uploads/files/srtm_5x5/TIFF/srtm*{:02d}_{:02d}.zip".format(i, j)
out_file = "/tmp/srtm_{:02d}\_{:02d}.tif".format(i, j)
if not exists(out_file):
print("Downloading: " + url)
http = urllib3.PoolManager()
r = http.request('GET', url)

        if r.status == 404:
            return -32768 * numpy.ones((6001, 6001))

        zipdata = BytesIO()
        zipdata.write(r.data)
        zip_file = zipfile.ZipFile(zipdata)
        zip_file.extractall("/tmp")
        r.release_conn()

    d_s = gdal.Open(out_file)
    return d_s.ReadAsArray()

if **name** == '**main**':
PARSER = argparse.ArgumentParser(description='Creates a DEM file ' +
'downloading the SRTM data and ' +
'splitting it to the specified ' +
' bounding box')
PARSER.add_argument('out_file', type=str,
help='The out GeoTIFF file')
PARSER.add_argument('epsg', type=int,
help='The output file EPSG code')
PARSER.add_argument('bbox', type=float, nargs=4,
help='The output file bounding box: xmin ymin xmax ymax')
PARSER.add_argument('resolution', type=float, nargs=2,
help='The x and y resolution')
ARGS = PARSER.parse_args()

    try:
        dem_creator(ARGS.out_file, ARGS.epsg, ARGS.bbox, ARGS.resolution)
    except Exception as err:
        print("An error occurred")
        print(err)

```

## Links

- [The SRTM Wikipedia web site][1]
- [The SRTM 90m DEM Digital Elevation Database][2]

The [space shuttle icon was taken from the Wikipedia](https://es.m.wikipedia.org/wiki/Archivo:P_Space_Shuttle_grey.svg)

[1]: https://en.wikipedia.org/wiki/Shuttle_Radar_Topography_Mission
[2]: http://srtm.csi.cgiar.org/

```

```
