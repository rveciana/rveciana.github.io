var d3_selection = require("d3-selection");
var d3_geo = require("d3-geo");
var d3_request = require("d3-request");
var d3_marching_squares = require("d3-marching-squares");
var topojson = require("topojson");
var GeoTIFF = require("geotiff");
var d3_scale_chromatic = require("d3-scale-chromatic");

var width = 680,
    height = 500;

var projection = d3_geo.geoAzimuthalEqualArea()
    .rotate([-55.5, -24])
    .scale(1100);

var canvas = d3_selection.select("body").append("canvas")
    .attr("width", width)
    .attr("height", height);

var context = canvas.node().getContext("2d");
var path = d3_geo.geoPath()
    .projection(projection)
    .context(context);

d3_request.request("tz850.tiff")
  .responseType('arraybuffer')
  .get(function(error, tiffData){
d3_request.json("world-110m.json", function(error, topojsonData) {

    var tiff = GeoTIFF.parse(tiffData.response);
    var image = tiff.getImage(); 
    var rasters = image.readRasters();
    var tiepoint = image.getTiePoints()[0];
    var pixelScale = image.getFileDirectory().ModelPixelScale;
    var geoTransform = [tiepoint.x, pixelScale[0], 0, tiepoint.y, 0, -1*pixelScale[1]];


    var zData = new Array(image.getHeight());
    var tempData = new Array(image.getHeight());
    for (var j = 0; j<image.getHeight(); j++){ 
        zData[j] = new Array(image.getWidth());
        tempData[j] = new Array(image.getWidth());
        for (var i = 0; i<image.getWidth(); i++){
            zData[j][i] = rasters[0][i + j*image.getWidth()];
            tempData[j][i] = rasters[1][i + j*image.getWidth()];
        }
    }

    var countries = topojson.feature(topojsonData, topojsonData.objects.countries);
    context.beginPath();
    context.strokeStyle = "#000";
    path(countries);
    context.fill();


    var intervalsTemp = [14,17,20,23,26,29, 35, 38];

    var bandsTemp = d3_marching_squares.isobands(tempData, geoTransform, intervalsTemp);

    bandsTemp.features.forEach(function(d, i) {
      context.beginPath();
      context.globalAlpha = 0.9;
      context.fillStyle = d3_scale_chromatic.interpolateRdBu(1-(i/(bandsTemp.features.length-1)));
      path(d);
      context.fill();
    });

    
    var countries = topojson.feature(topojsonData, topojsonData.objects.countries);
    context.beginPath();
    context.strokeStyle = "#000";
    context.lineWidth = 1.5;
    context.globalAlpha = 0.5;
    path(countries);
    context.stroke();

    var intervalsZ = [1400, 1420, 1440, 1460, 1480, 1500, 1520, 1540];
    var linesZ = d3_marching_squares.isolines(zData, geoTransform, intervalsZ);

    linesZ.features.forEach(function(d, i) {
      context.beginPath();
      context.strokeStyle = "#000";
      context.lineWidth = 2;
      context.globalAlpha = 1;
      path(d);
      context.stroke();
    });

});
});
