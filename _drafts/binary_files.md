---
layout: post
title: Raster file formats for JavaScript mapping
date:   2017-10-26
categories: d3
tags: [raster, canvas, svg]
teaser: raster-file-formats-javascript.png
description: Different options to retrieve raster data using JavaScript
thumbnail: /images/d3/raster-file-formats-javascript/twitter.png
twitter-card: summary
---

Some time ago, I made some docs about [drawing raster data with d3js][1]. 

All the examples GeoTIFF files to get the data, but there are many other possibilities. I've made the exercice to create some examples using the same dataset but different strategies for creating the data with different formats.

* [The data](#the-data)
* [GeoTIFF](#geotiff)
    + [Compression](#compression)
    + [HTML example](#html-example)
* [NetCDF](#netcdf)
    + [HTML example](#html-example-1)
* [JSON](#json)
* [JSON with encoded data](#json-with-encoded-data)
* [Binary data](#binary-data)
* [LZW compressed binary data](#lzw-compressed-binary-data)
* [Performance comparison](#performance-comparison)


The data
--------

All the examples use the data from [this block][2]. You can see [how I got the data here][3]. I have taken only the first layer (msl pressure) to make the examples simpler:

    gdal_translate -b 1 vardah.tiff vardah_new.tiff

You can [download here][4] the original [vardah.tiff][4] file.

GeoTIFF
-------
As in the original example, GeoTIFF can be used as a way to get the raster data. It's got many advantages, such as being the most widespread format, able to be compressed, that it's possible to open it directly with any GIS program such as QGIS.

To use it, use the [geotiff.js library][5]. 

### Compression
The compressed images are read directly by the latest versions of the library. The compression can reduce the size a lot, specially with the *Deflate* option. The parsing time is bigger when the image is compressed, but the time is acceptable.

To create a compressed GeoTIFF file, use the gdal ctreation options:

    gdal_translate -of GTiff -co COMPRESS=DEFLATE vardah.tiff vardah2.tiff
    gdal_translate -of GTiff -co COMPRESS=LZW vardah.tiff vardah2.tiff
    gdal_translate -of GTiff -co COMPRESS=PACKBITS vardah.tiff vardah2.tiff

Other compression options are not available with the geotiffjs library.

Another thing to take in account is the metadata. The geotransform data is stored in a quite strange way (see tiepoint and pxelscale in the [example][1], and the GDAL metadata, in a special "GDAL" tag, which is not easy to find, although it is not when using python+GDAL.

### HTML example
{% highlight js %}
<!DOCTYPE html>
<html>
    <meta>
    <script src='geotiff.min.js'></script>
    </meta>

    <body>
<script>

var urlpath =  "vardah.tiff"

var oReq = new XMLHttpRequest();
oReq.open("GET", urlpath, true);
oReq.responseType = "arraybuffer";

oReq.onload = function(oEvent) {
  var t0 = performance.now();
  var tiff = GeoTIFF.parse(this.response);
  var image = tiff.getImage();
  var data = image.readRasters()[0];
  var tiepoint = image.getTiePoints()[0];
  var pixelScale = image.getFileDirectory().ModelPixelScale;
  var t1 = performance.now();
  console.log("Decoding took " + (t1 - t0) + " milliseconds.")
};
oReq.send(); //start process


</script>
{% endhighlight %}

NetCDF
------
NetCDF is a popular format among meteorology data. The format is quite simple and very flexible. As in the case of GeoTIFF, GDAL can write NetCDF files with a special form and there is a [JavaScript library, netcdfjs][6] that reads the format and it's fast and not very big. It can be opened with QGIS if created with GDAL.

To create a NetCDF file from a GeoTIFF, just run:

    gdal_translate -of netCDF -b 1 vardah.tiff vardah.nc

The name of the output band will be *Band1*, which is not very nice, since the actual name is stored in another field, not the one used to retrieve the data.

### HTML example
{% highlight js %}
<!DOCTYPE html>
<html>
    <meta>
    <script src='netcdfjs.js'></script>
    </meta>

    <body>
<script>

var urlpath =  "vardah.nc"
var reader;

var oReq = new XMLHttpRequest();
oReq.open("GET", urlpath, true);
oReq.responseType = "blob";

oReq.onload = function(oEvent) {
  var t0 = performance.now();    
  var blob = oReq.response;
  reader_url = new FileReader();
  
  reader_url.onload = function(e) {
    var t0 = performance.now();
    reader = new netcdfjs(this.result);
    var dataValues = reader.getDataVariable('Band1');
    var t1 = performance.now();
    console.log("Decoding took " + (t1 - t0) + " milliseconds.")
  }
      
  var arrayBuffer = reader_url.readAsArrayBuffer(blob);
  
};
oReq.send(); //start process


</script>
{% endhighlight %}

* The variables *lat* and *lon* return the geographical coordinates for every pixel, which is a good feature
* Some metadata is stored in different variables and fields. Take a look to the library api to see them, but:
    * Printing *reader.variables* will output a set ob objects with the projection information, longitudes and latitudes
    * *reader.dimensions* stores the matrix size
    * *globalAttributes* stores other metadata, such as the creation date, GDAL information, etc

JSON
----

This format is the first that comes in mind when thinking about sharing data. It's the esiest to understand, and reading it is the most simple thing to code. But it's a bad idea using it with medium sized matrices, since the size can be for times or more than the original uncompressed GeoTIFF.

### HTML example
{% highlight js %}
<!DOCTYPE html>
<html>
    <body>

<script>

var oReq = new XMLHttpRequest();


oReq.addEventListener("load", function(data){
    var t0 = performance.now();
    var jsonData = JSON.parse(this.response);
    var t1 = performance.now();
    console.log("Decoding took " + (t1 - t0) + " milliseconds.")
    
});

oReq.open("GET", "vardah.json");
oReq.send();


</script>
{% endhighlight %}

* Just parse the JSON file!
* Of course, all the metadata is easy to add, so the format is very flexible

Creating the JSON sample file using python is easy:

{% highlight python %}
import gdal
import json
from base64 import b64encode
import struct

d_s = gdal.Open("vardah.tiff")
data = d_s.GetRasterBand(1).ReadAsArray()
print(data.dtype)
out_data = []
print("Size:", data.shape)
for j in range(data.shape[0]):
    for i in range(data.shape[1]):
        out_data.append(float(data[j][i]))

json_data = {}
json_data['nx']= data.shape[1]
json_data['ny']= data.shape[0]
json_data['data'] = out_data

fp = open("vardah.json", "w")
fp.write(json.dumps(json_data))
fp.close()

{% endhighlight %}

* To make consisent data, put all the numbers in a list, but a matrix could be created the same way, and could be more convenient in certain cases

JSON with encoded data
----------------------
Plain JSON data is expensive in terms of space. What if we encode the data in [Base64][7]? The data will be much smaller and the JSON format can store all the metadata we want with the same flexibility.

Let's look first at how can we create the sample file:

{% highlight python %}
import gdal
import json
from base64 import b64encode
import struct

d_s = gdal.Open("vardah.tiff")
data = d_s.GetRasterBand(1).ReadAsArray()
print(data.dtype)
out_data = []
print("Size:", data.shape)
for j in range(data.shape[0]):
    for i in range(data.shape[1]):
        out_data.append(float(data[j][i]))

json_data = {}
json_data['nx']= data.shape[1]
json_data['ny']= data.shape[0]

b64 = b64encode(struct.pack(str(len(out_data))+'f', *out_data)).decode("utf-8")

json_data['data'] = b64
fp = open("vardahb64.json", "w")
fp.write(json.dumps(json_data))
fp.close()
{% endhighlight %}

* Just encode the list after packing it as a binary string
    * I have packed the elements using a *f*, so as float32 values. If this is changed, remember to change the decoding part! Some variables such as classfications can be stored as bytes, which is much more efficient
    * The *b64encode* function returns in bytes, so it has to be encoded to utf-8 to serialize it into a JSON

### HTML example
{% highlight js %}
<!DOCTYPE html>
<html>
    <body>

<script>

var oReq = new XMLHttpRequest();


oReq.addEventListener("load", function(data){
    var t0 = performance.now();
    var jsonData = JSON.parse(this.response);
    var data = atob(jsonData['data']);
    var b = new Uint8Array(
            data.split("").map(function(d){return String.charCodeAt(d)})
        );
    var float32Data = new Float32Array(b.buffer);
    var t1 = performance.now();
    console.log("Decoding took " + (t1 - t0) + " milliseconds.")
    
});

oReq.open("GET", "vardahb64.json");
oReq.send();
{% endhighlight %}

</script>

Reading this data is quite efficient, but not as easy as plain JSON. The steps are:

* Parse the JSON data with the *JSON.parse* function
* Convert the encoded field to a binary string using the *atob* function. This decodes the *base64 string*
* Retrieve all the bytes
    * By splitting all the chars in the string, map all the characters to the UTF-16 codes using *String.charCodeAt*
    * Put all the values to a [JavaScript typed array][8], so we can convert them later
* Since the values were stored as float32, we create a *buffer* from the unigned int8 array and convert the types. That's all

Binary data
-----------

LZW compressed binary data
--------------------------

Performance comparison
----------------------

DEFLATE; LZW; PACKBITS


What to do with all this binary data?
-------------------------------------

Links
-----

* [drawing raster data with d3js][1]
* [Vardah and leaflet block][2]
* [Generating the Vardah data file][3]
* [The original geotiff file][4]
* [The geotiff.js library][5]
* [The netcdfjs library][6]
* [Base64 Wikipedia page][7]
* [JavaScript typed arrays][8]

[1]: http://geoexamples.com/d3-raster-tools-docs/
[2]: http://bl.ocks.org/rveciana/420a33fd0963e2a6aad16da54725af36
[3]: http://geoexamples.com/d3-raster-tools-docs/code_samples/vardah.html
[4]: bl.ocks.org/rveciana/raw/420a33fd0963e2a6aad16da54725af36/vardah.tiff
[5]: https://github.com/constantinius/geotiff.js
[6]: https://github.com/cheminfo-js/netcdfjs
[7]: https://en.wikipedia.org/wiki/Base64
[8]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays