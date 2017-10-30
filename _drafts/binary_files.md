---
layout: post
title: Raster file formats for JavaScript mapping
date:   2017-10-26
categories: d3
tags: [raster, canvas, retina]
teaser: canvas-retina.png
description: Creating canvas maps compatible with retina screens
thumbnail: /images/d3/canvas-mapping-retina/twitter.png
twitter-card: summary
---

Creating Python sample files
----------------------------

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


##########
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
