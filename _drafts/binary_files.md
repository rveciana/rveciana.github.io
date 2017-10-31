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

JSON
----

JSON with encoded data
----------------------

Binary data
-----------

LZW compressed binary data
--------------------------

Performance comparison
----------------------

DEFLATE; LZW; PACKBITS

{% highlight python %}
import gdal
import struct
from base64 import b64encode

d_s = gdal.Open("vardah.tiff")
data = d_s.GetRasterBand(1).ReadAsArray()
print(data.dtype)
out_data = []
print("Size:", data.shape)


for j in range(data.shape[0]):
    for i in range(data.shape[1]):
        out_data.append(float(data[j][i]))

fp = open("vardah.bin", "wb")
fp.write(struct.pack(str(len(out_data))+'f', *out_data))
fp.close()


# LZW

def compress(uncompressed):
    """Compress a string to a list of output symbols."""
 
    # Build the dictionary.
    dict_size = 256
    dictionary = dict((chr(i), i) for i in xrange(dict_size))
    # in Python 3: dictionary = {chr(i): i for i in range(dict_size)}
    #dictionary = {chr(i): i for i in range(dict_size)}
 
    w = ""
    result = []
    for c in uncompressed:
        wc = w + c
        if wc in dictionary:
            w = wc
        else:
            result.append(dictionary[w])
            # Add wc to the dictionary.
            dictionary[wc] = dict_size
            dict_size += 1
            w = c
 
    # Output the code for w.
    if w:
        result.append(dictionary[w])
    return result

#compressed = compress(b64encode(struct.pack(str(len(out_data))+'f', *out_data)))
out_data = []
for j in range(data.shape[0]):
    for i in range(data.shape[1]):
        out_data.append(float(data[j][i]))
out_data_bytes = struct.pack(str(len(out_data))+'f', *out_data)
print(len(out_data_bytes))
compressed = compress(out_data_bytes)

print(len(compressed))

fp = open("vardah.lzw.bin", "wb")
fp.write(struct.pack(str(len(compressed))+'H', *compressed))
fp.close()


test = struct.pack(str(len(out_data))+'f', *out_data)

print(struct.unpack("1B", test[0]))
{% endhighlight %}

JSON
----

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


##############
#base64
b64 = b64encode(struct.pack(str(len(out_data))+'f', *out_data)).decode("utf-8")

json_data['data'] = b64
fp = open("vardahb64.json", "w")
fp.write(json.dumps(json_data))
fp.close()
{% endhighlight %}


Reading the created files
-------------------------
{% highlight js %}
<!DOCTYPE html>
<html>
    <body>
<script>

var oReq = new XMLHttpRequest();

oReq.addEventListener("load", function(data){
    var t0 = performance.now();    
    var floatArray= new Float32Array(this.response);
    var t1 = performance.now();
    console.log("Decoding took " + (t1 - t0) + " milliseconds.")


});

oReq.open("GET", "vardah.bin");
oReq.responseType = 'arraybuffer';
oReq.send();


</script>
{% endhighlight %}

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
  var t1 = performance.now();
  console.log("Decoding took " + (t1 - t0) + " milliseconds.")
};
oReq.send(); //start process


</script>
{% endhighlight %}

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
    //console.info(float32Data);
    var t1 = performance.now();
    console.log("Decoding took " + (t1 - t0) + " milliseconds.")
    
});

oReq.open("GET", "vardahb64.json");
oReq.send();


</script>
{% endhighlight %}

{% highlight js %}
<!DOCTYPE html>
<html>
    <body>
<script>

var oReq = new XMLHttpRequest();

oReq.addEventListener("load", function(data){
    var t0 = performance.now();    
    var compressedArray = new Uint16Array(this.response);
    console.info(compressedArray.length);
    var uncompressed = uncompress(compressedArray);

    
    //console.info(uncompressed);
    
    var t1 = performance.now();
    console.log("Decoding took " + (t1 - t0) + " milliseconds.")


});



oReq.open("GET", "vardah.lzw.bin");
oReq.responseType = 'arraybuffer';
oReq.send();


//https://rosettacode.org/wiki/LZW_compression#JavaScript
function uncompress(compressed) {
        var i,
            dictionary = [],
            w,
            result,
            floatResult = [],
            k,
            entry = "",
            dictSize = 256;
        for (i = 0; i < 256; i += 1) {
            dictionary[i] = String.fromCharCode(i);
        }
 
        w = String.fromCharCode(compressed[0]);
        result = w;
        for (i = 1; i < compressed.length; i += 1) {
            k = compressed[i];
            if (dictionary[k]) {
                entry = dictionary[k];
            } else {
                if (k === dictSize) {
                    entry = w + w.charAt(0);
                } else {
                    return null;
                }
            }
 
            result += entry;
 
            // Add w+entry[0] to the dictionary.
            dictionary[dictSize++] = w + entry.charAt(0);
 
            w = entry;
        }

        //Convert from chars to float32 array
        var b = new Uint8Array(
            result.split("").map(function(d){return String.charCodeAt(d)})
        );
        return new Float32Array(b.buffer);
    }





</script>
{% endhighlight %}

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
    reader = new netcdfjs(this.result);
    console.info("DONE", reader.variables);
    var dataValues = reader.getDataVariable('Band1');
    //console.info(dataValues);
    var t1 = performance.now();
    console.log("Decoding took " + (t1 - t0) + " milliseconds.")
    console.info(dataValues);
    var dataValues = reader.getDataVariable('lat');
    console.info(dataValues);
  }
      
  var arrayBuffer = reader_url.readAsArrayBuffer(blob);
  
};
oReq.send(); //start process


</script>
{% endhighlight %}


Altres coses
------------
gdal_translate -of netCDF -b 1 vardah.tiff vardah.nc

Instal·lar netcdf.js
--------------------
npm install netcdfjs
cd node_modules/netcdfjs/dist

O bé  <script src='http://www.lactame.com/lib/netcdfjs/0.3.0/netcdfjs.min.js'></script>

Compressió.
 gdal_translate -of GTiff -co COMPRESS=LZW vardah.tiff vardah2.tiff




Directe javascript

LZW: 
https://rosettacode.org/wiki/LZW_compression TOTS ELS LLENGUATGES!

https://gist.github.com/revolunet/843889

 Inflate / deflate: https://github.com/nodeca/pako


 Convertir char a unsignedChar (struct c a B): String.charCodeAt(uncompressed[0])


Links
-----

* [drawing raster data with d3js][1]
* [Vardah and leaflet block][2]
* [Generating the Vardah data file][3]
* [The original geotiff file][4]
* [The geotiff.js library][5]

[1]: http://geoexamples.com/d3-raster-tools-docs/
[2]: http://bl.ocks.org/rveciana/420a33fd0963e2a6aad16da54725af36
[3]: http://geoexamples.com/d3-raster-tools-docs/code_samples/vardah.html
[4]: bl.ocks.org/rveciana/raw/420a33fd0963e2a6aad16da54725af36/vardah.tiff
[5]: https://github.com/constantinius/geotiff.js