// http://geoexamples.com/d3-composite-projections/ Version 1.0.0. Copyright 2016 Roger Veciana i Rovira.
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-geo'), require('d3-path')) :
  typeof define === 'function' && define.amd ? define(['exports', 'd3-geo', 'd3-path'], factory) :
  (factory((global.d3 = global.d3 || {}),global.d3,global.d3));
}(this, function (exports,d3Geo,d3Path) { 'use strict';

  var epsilon = 1e-6;

  // The projections must have mutually exclusive clip regions on the sphere,
  // as this will avoid emitting interleaving lines and polygons.
  function multiplex(streams) {
    var n = streams.length;
    return {
      point: function(x, y) { var i = -1; while (++i < n) streams[i].point(x, y); },
      sphere: function() { var i = -1; while (++i < n) streams[i].sphere(); },
      lineStart: function() { var i = -1; while (++i < n) streams[i].lineStart(); },
      lineEnd: function() { var i = -1; while (++i < n) streams[i].lineEnd(); },
      polygonStart: function() { var i = -1; while (++i < n) streams[i].polygonStart(); },
      polygonEnd: function() { var i = -1; while (++i < n) streams[i].polygonEnd(); }
    };
  }

  // A composite projection for the United States, configured by default for
  // 960×500. Also works quite well at 960×600 with scale 1285. The set of
  // standard parallels for each region comes from USGS, which is published here:
  // http://egsc.usgs.gov/isb/pubs/MapProjections/projections.html#albers
  function albersUsa() {
    var cache,
        cacheStream,
        lower48 = d3Geo.geoAlbers(), lower48Point,
        alaska = d3Geo.geoConicEqualArea().rotate([154, 0]).center([-2, 58.5]).parallels([55, 65]), alaskaPoint, // EPSG:3338
        hawaii = d3Geo.geoConicEqualArea().rotate([157, 0]).center([-3, 19.9]).parallels([8, 18]), hawaiiPoint, // ESRI:102007
        point, pointStream = {point: function(x, y) { point = [x, y]; }};

    function albersUsa(coordinates) {
      var x = coordinates[0], y = coordinates[1];
      return point = null,
          (lower48Point.point(x, y), point)
          || (alaskaPoint.point(x, y), point)
          || (hawaiiPoint.point(x, y), point);
    }

    albersUsa.invert = function(coordinates) {
      var k = lower48.scale(),
          t = lower48.translate(),
          x = (coordinates[0] - t[0]) / k,
          y = (coordinates[1] - t[1]) / k;
      return (y >= 0.120 && y < 0.234 && x >= -0.425 && x < -0.214 ? alaska
          : y >= 0.166 && y < 0.234 && x >= -0.214 && x < -0.115 ? hawaii
          : lower48).invert(coordinates);
    };

    albersUsa.stream = function(stream) {
      return cache && cacheStream === stream ? cache : cache = multiplex([lower48.stream(cacheStream = stream), alaska.stream(stream), hawaii.stream(stream)]);
    };

    albersUsa.precision = function(_) {
      if (!arguments.length) return lower48.precision();
      lower48.precision(_), alaska.precision(_), hawaii.precision(_);
      return albersUsa;
    };

    albersUsa.scale = function(_) {
      if (!arguments.length) return lower48.scale();
      lower48.scale(_), alaska.scale(_ * 0.35), hawaii.scale(_);
      return albersUsa.translate(lower48.translate());
    };

    albersUsa.translate = function(_) {
      if (!arguments.length) return lower48.translate();
      var k = lower48.scale(), x = +_[0], y = +_[1];

      lower48Point = lower48
          .translate(_)
          .clipExtent([[x - 0.455 * k, y - 0.238 * k], [x + 0.455 * k, y + 0.238 * k]])
          .stream(pointStream);

      alaskaPoint = alaska
          .translate([x - 0.307 * k, y + 0.201 * k])
          .clipExtent([[x - 0.425 * k + epsilon, y + 0.120 * k + epsilon], [x - 0.214 * k - epsilon, y + 0.234 * k - epsilon]])
          .stream(pointStream);

      hawaiiPoint = hawaii
          .translate([x - 0.205 * k, y + 0.212 * k])
          .clipExtent([[x - 0.214 * k + epsilon, y + 0.166 * k + epsilon], [x - 0.115 * k - epsilon, y + 0.234 * k - epsilon]])
          .stream(pointStream);

      return albersUsa;
    };
    
    albersUsa.drawCompositionBorders = function(context) {
      var hawaii1 = lower48([-102.91, 26.3]);
      var hawaii2 = lower48([-104.0, 27.5]);
      var hawaii3 = lower48([-108.0, 29.1]);
      var hawaii4 = lower48([-110.0, 29.1]);

      var alaska1 = lower48([-110.0, 26.7]);
      var alaska2 = lower48([-112.8, 27.6]);
      var alaska3 = lower48([-114.3, 30.6]);
      var alaska4 = lower48([-119.3, 30.1]);

      context.moveTo(hawaii1[0], hawaii1[1]);
      context.lineTo(hawaii2[0], hawaii2[1]);
      context.lineTo(hawaii3[0], hawaii3[1]);
      context.lineTo(hawaii4[0], hawaii4[1]);

      context.moveTo(alaska1[0], alaska1[1]);
      context.lineTo(alaska2[0], alaska2[1]);
      context.lineTo(alaska3[0], alaska3[1]);
      context.lineTo(alaska4[0], alaska4[1]);

    };
    albersUsa.getCompositionBorders = function() {
      var context = d3Path.path();
      this.drawCompositionBorders(context);
      return context.toString();

    };


    return albersUsa.scale(1070);
  }

  // The projections must have mutually exclusive clip regions on the sphere,
  // as this will avoid emitting interleaving lines and polygons.
  function multiplex$1(streams) {
    var n = streams.length;
    return {
      point: function(x, y) { var i = -1; while (++i < n) streams[i].point(x, y); },
      sphere: function() { var i = -1; while (++i < n) streams[i].sphere(); },
      lineStart: function() { var i = -1; while (++i < n) streams[i].lineStart(); },
      lineEnd: function() { var i = -1; while (++i < n) streams[i].lineEnd(); },
      polygonStart: function() { var i = -1; while (++i < n) streams[i].polygonStart(); },
      polygonEnd: function() { var i = -1; while (++i < n) streams[i].polygonEnd(); }
    };
  }

  // A composite projection for the United States, configured by default for
  // 960×500. Also works quite well at 960×600 with scale 1285. The set of
  // standard parallels for each region comes from USGS, which is published here:
  // http://egsc.usgs.gov/isb/pubs/MapProjections/projections.html#albers
  function albersUsaTerritories() {
    var cache,
        cacheStream,
        lower48 = d3Geo.geoAlbers(), lower48Point,
        alaska = d3Geo.geoConicEqualArea().rotate([154, 0]).center([-2, 58.5]).parallels([55, 65]), alaskaPoint, // EPSG:3338
        hawaii = d3Geo.geoConicEqualArea().rotate([157, 0]).center([-3, 19.9]).parallels([8, 18]), hawaiiPoint, // ESRI:102007
        puertoRico = d3Geo.geoConicEqualArea().rotate([66, 0]).center([0, 18]).parallels([8, 18]), puertoRicoPoint, //Taken from https://bl.ocks.org/mbostock/5629120
        samoa = d3Geo.geoEquirectangular().rotate([173, 14]), samoaPoint, // EPSG:4169
        guam = d3Geo.geoEquirectangular().rotate([-145, -16.8]), guamPoint,
        point, pointStream = {point: function(x, y) { point = [x, y]; }};

        /*
        var puertoRicoBbox = [[-68.3, 19], [-63.9, 17]];
        var samoaBbox = [[-171, -14], [-168, -14.8]];
        var guamBbox = [[144, 20.8], [146.5, 12.7]];
        */

    function albersUsa(coordinates) {
      var x = coordinates[0], y = coordinates[1];

      return point = null,
          (lower48Point.point(x, y), point) ||
          (alaskaPoint.point(x, y), point)  ||
          (hawaiiPoint.point(x, y), point)  ||
          (puertoRicoPoint.point(x, y), point) ||
          (samoaPoint.point(x, y), point)   ||
          (guamPoint.point(x, y), point);
    }

    albersUsa.invert = function(coordinates) {

      var k = lower48.scale(),
          t = lower48.translate(),
          x = (coordinates[0] - t[0]) / k,
          y = (coordinates[1] - t[1]) / k;
          /*
          //How are the return values calculated:
          console.info("******");
          var c0 = puertoRico(puertoRicoBbox[0]);
          var x0 = (c0[0] - t[0]) / k;
          var y0 = (c0[1] - t[1]) / k;

          console.info("p0 puertoRico", x0 + ' - ' + y0);

          var c1 = puertoRico(puertoRicoBbox[1]);
          var x1 = (c1[0] - t[0]) / k;
          var y1 = (c1[1] - t[1]) / k;

          console.info("p1 puertoRico", x1 + ' - ' + y1);

          c0 = samoa(samoaBbox[0]);
          x0 = (c0[0] - t[0]) / k;
          y0 = (c0[1] - t[1]) / k;

          console.info("p0 samoa", x0 + ' - ' + y0);

          c1 = samoa(samoaBbox[1]);
          x1 = (c1[0] - t[0]) / k;
          y1 = (c1[1] - t[1]) / k;

          console.info("p1 samoa", x1 + ' - ' + y1);

          c0 = guam(guamBbox[0]);
          x0 = (c0[0] - t[0]) / k;
          y0 = (c0[1] - t[1]) / k;

          console.info("p0 guam", x0 + ' - ' + y0);

          c1 = guam(guamBbox[1]);
          x1 = (c1[0] - t[0]) / k;
          y1 = (c1[1] - t[1]) / k;

          console.info("p1 guam", x1 + ' - ' + y1);
          */

      return (y >= 0.120 && y < 0.234 && x >= -0.425 && x < -0.214 ? alaska
          : y >= 0.166 && y < 0.234 && x >= -0.214 && x < -0.115 ? hawaii
          : y >= 0.2064 && y < 0.2413 && x >= 0.312 && x < 0.385 ? puertoRico
          : y >= 0.09 && y < 0.1197 && x >= -0.4243 && x < -0.3232 ? samoa
          : y >= -0.0518 && y < 0.0895 && x >= -0.4243 && x < -0.3824 ? guam
          : lower48).invert(coordinates);

    };

    albersUsa.stream = function(stream) {
      return cache && cacheStream === stream ? cache : cache = multiplex$1([lower48.stream(cacheStream = stream), alaska.stream(stream), hawaii.stream(stream), puertoRico.stream(stream), samoa.stream(stream), guam.stream(stream)]);
    };

    albersUsa.precision = function(_) {
      if (!arguments.length) {return lower48.precision();}
      lower48.precision(_);
      alaska.precision(_);
      hawaii.precision(_);
      puertoRico.precision(_);
      samoa.precision(_);
      guam.precision(_);
      return albersUsa;
    };

    albersUsa.scale = function(_) {
      if (!arguments.length) {return lower48.scale();}
      lower48.scale(_);
      alaska.scale(_ * 0.35);
      hawaii.scale(_);
      puertoRico.scale(_);
      samoa.scale(_* 2);
      guam.scale(_);
      return albersUsa.translate(lower48.translate());
    };

    albersUsa.translate = function(_) {
      if (!arguments.length) {return lower48.translate();}
      var k = lower48.scale(), x = +_[0], y = +_[1];

      /*
      var c0 = puertoRico.translate([x + 0.350 * k, y + 0.224 * k])(puertoRicoBbox[0]);
      var x0 = (x - c0[0]) / k;
      var y0 = (y - c0[1]) / k;

      var c1 = puertoRico.translate([x + 0.350 * k, y + 0.224 * k])(puertoRicoBbox[1]);
      var x1 = (x - c1[0]) / k;
      var y1 = (y - c1[1]) / k;

      console.info('puertoRico: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);
      console.info('.clipExtent([[x '+
       (x0<0?'+ ':'- ') + Math.abs(x0.toFixed(4))+
       ' * k + epsilon, y '+
       (y0<0?'+ ':'- ') + Math.abs(y0.toFixed(4))+
       ' * k + epsilon],[x '+
       (x1<0?'+ ':'- ') + Math.abs(x1.toFixed(4))+
       ' * k - epsilon, y '+
       (y1<0?'+ ':'- ') + Math.abs(y1.toFixed(4))+
       ' * k - epsilon]])');

        c0 = samoa.translate([x - 0.492 * k, y + 0.09 * k])(samoaBbox[0]);
        x0 = (x - c0[0]) / k;
        y0 = (y - c0[1]) / k;

        c1 = samoa.translate([x - 0.492 * k, y + 0.09 * k])(samoaBbox[1]);
        x1 = (x - c1[0]) / k;
        y1 = (y - c1[1]) / k;

       console.info('samoa: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);
       console.info('.clipExtent([[x '+
        (x0<0?'+ ':'- ') + Math.abs(x0.toFixed(4))+
        ' * k + epsilon, y '+
        (y0<0?'+ ':'- ') + Math.abs(y0.toFixed(4))+
        ' * k + epsilon],[x '+
        (x1<0?'+ ':'- ') + Math.abs(x1.toFixed(4))+
        ' * k - epsilon, y '+
        (y1<0?'+ ':'- ') + Math.abs(y1.toFixed(4))+
        ' * k - epsilon]])');

        c0 = guam.translate([x - 0.408 * k, y + 0.018 * k])(guamBbox[0]);
        x0 = (x - c0[0]) / k;
        y0 = (y - c0[1]) / k;

        c1 = guam.translate([x - 0.408 * k, y + 0.018 * k])(guamBbox[1]);
        x1 = (x - c1[0]) / k;
        y1 = (y - c1[1]) / k;

       console.info('guam: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);
       console.info('.clipExtent([[x '+
        (x0<0?'+ ':'- ') + Math.abs(x0.toFixed(4))+
        ' * k + epsilon, y '+
        (y0<0?'+ ':'- ') + Math.abs(y0.toFixed(4))+
        ' * k + epsilon],[x '+
        (x1<0?'+ ':'- ') + Math.abs(x1.toFixed(4))+
        ' * k - epsilon, y '+
        (y1<0?'+ ':'- ') + Math.abs(y1.toFixed(4))+
        ' * k - epsilon]])');
        */

      lower48Point = lower48
          .translate(_)
          .clipExtent([[x - 0.455 * k, y - 0.238 * k], [x + 0.455 * k, y + 0.238 * k]])
          .stream(pointStream);

      alaskaPoint = alaska
          .translate([x - 0.307 * k, y + 0.201 * k])
          .clipExtent([[x - 0.425 * k + epsilon, y + 0.120 * k + epsilon], [x - 0.214 * k - epsilon, y + 0.233 * k - epsilon]])
          .stream(pointStream);

      hawaiiPoint = hawaii
          .translate([x - 0.205 * k, y + 0.212 * k])
          .clipExtent([[x - 0.214 * k + epsilon, y + 0.166 * k + epsilon], [x - 0.115 * k - epsilon, y + 0.233 * k - epsilon]])
          .stream(pointStream);

      puertoRicoPoint = puertoRico
          .translate([x + 0.350 * k, y + 0.224 * k])
          .clipExtent([[x + 0.312 * k + epsilon, y + 0.2064 * k + epsilon],[x + 0.385 * k - epsilon, y + 0.233 * k - epsilon]])
          .stream(pointStream);

      samoaPoint = samoa
          .translate([x - 0.492 * k, y + 0.09 * k])
          .clipExtent([[x - 0.4243 * k + epsilon, y + 0.0903 * k + epsilon],[x - 0.3233 * k - epsilon, y + 0.1197 * k - epsilon]])
          .stream(pointStream);

      guamPoint = guam
          .translate([x - 0.408 * k, y + 0.018 * k])
          .clipExtent([[x - 0.4244 * k + epsilon, y - 0.0519 * k + epsilon],[x - 0.3824 * k - epsilon, y + 0.0895 * k - epsilon]])
          .stream(pointStream);


      return albersUsa;
    };

    albersUsa.drawCompositionBorders = function(context) {

      /*
      console.info("CLIP EXTENT hawaii: ", hawaii.clipExtent());
      console.info("UL BBOX:", lower48.invert([hawaii.clipExtent()[0][0], hawaii.clipExtent()[0][1]]));
      console.info("UR BBOX:", lower48.invert([hawaii.clipExtent()[1][0], hawaii.clipExtent()[0][1]]));
      console.info("LD BBOX:", lower48.invert([hawaii.clipExtent()[1][0], hawaii.clipExtent()[1][1]]));
      console.info("LL BBOX:", lower48.invert([hawaii.clipExtent()[0][0], hawaii.clipExtent()[1][1]]));

      console.info("CLIP EXTENT alaska: ", alaska.clipExtent());
      console.info("UL BBOX:", lower48.invert([alaska.clipExtent()[0][0], alaska.clipExtent()[0][1]]));
      console.info("UR BBOX:", lower48.invert([alaska.clipExtent()[1][0], alaska.clipExtent()[0][1]]));
      console.info("LD BBOX:", lower48.invert([alaska.clipExtent()[1][0], alaska.clipExtent()[1][1]]));
      console.info("LL BBOX:", lower48.invert([alaska.clipExtent()[0][0], alaska.clipExtent()[1][1]]));

      console.info("CLIP EXTENT puertoRico: ", puertoRico.clipExtent());
      console.info("UL BBOX:", lower48.invert([puertoRico.clipExtent()[0][0], puertoRico.clipExtent()[0][1]]));
      console.info("UR BBOX:", lower48.invert([puertoRico.clipExtent()[1][0], puertoRico.clipExtent()[0][1]]));
      console.info("LD BBOX:", lower48.invert([puertoRico.clipExtent()[1][0], puertoRico.clipExtent()[1][1]]));
      console.info("LL BBOX:", lower48.invert([puertoRico.clipExtent()[0][0], puertoRico.clipExtent()[1][1]]));

      console.info("CLIP EXTENT samoa: ", samoa.clipExtent());
      console.info("UL BBOX:", lower48.invert([samoa.clipExtent()[0][0], samoa.clipExtent()[0][1]]));
      console.info("UR BBOX:", lower48.invert([samoa.clipExtent()[1][0], samoa.clipExtent()[0][1]]));
      console.info("LD BBOX:", lower48.invert([samoa.clipExtent()[1][0], samoa.clipExtent()[1][1]]));
      console.info("LL BBOX:", lower48.invert([samoa.clipExtent()[0][0], samoa.clipExtent()[1][1]]));


      console.info("CLIP EXTENT guam: ", guam.clipExtent());
      console.info("UL BBOX:", lower48.invert([guam.clipExtent()[0][0], guam.clipExtent()[0][1]]));
      console.info("UR BBOX:", lower48.invert([guam.clipExtent()[1][0], guam.clipExtent()[0][1]]));
      console.info("LD BBOX:", lower48.invert([guam.clipExtent()[1][0], guam.clipExtent()[1][1]]));
      console.info("LL BBOX:", lower48.invert([guam.clipExtent()[0][0], guam.clipExtent()[1][1]]));
      */

      var ulhawaii = lower48([-110.4641, 28.2805]);
      var urhawaii = lower48([-104.0597, 28.9528]);
      var ldhawaii = lower48([-103.7049, 25.1031]);
      var llhawaii = lower48([-109.8337, 24.4531]);

      var ulalaska = lower48([ -124.4745, 28.1407]);
      var uralaska = lower48([ -110.931, 30.8844]);
      var ldalaska = lower48([-109.8337, 24.4531]);
      var llalaska = lower48([-122.4628, 21.8562]);

      var ulpuertoRico = lower48([-76.8579, 25.1544]);
      var urpuertoRico = lower48([-72.429, 24.2097]);
      var ldpuertoRico = lower48([-72.8265, 22.7056]);
      var llpuertoRico = lower48([-77.1852, 23.6392]);


      var ulsamoa = lower48([-125.0093, 29.7791]);
      var ursamoa = lower48([-118.5193, 31.3262]);
      var ldsamoa = lower48([-118.064, 29.6912]);
      var llsamoa = lower48([-124.4369, 28.169]);

      var ulguam = lower48([-128.1314, 37.4582]);
      var urguam = lower48([-125.2132, 38.214]);
      var ldguam = lower48([-122.3616, 30.5115]);
      var llguam = lower48([-125.0315, 29.8211]);

      context.moveTo(ulhawaii[0], ulhawaii[1]);
      context.lineTo(urhawaii[0], urhawaii[1]);
      context.lineTo(ldhawaii[0], ldhawaii[1]);
      context.lineTo(ldhawaii[0], ldhawaii[1]);
      context.lineTo(llhawaii[0], llhawaii[1]);
      context.closePath();

      context.moveTo(ulalaska[0], ulalaska[1]);
      context.lineTo(uralaska[0], uralaska[1]);
      context.lineTo(ldalaska[0], ldalaska[1]);
      context.lineTo(ldalaska[0], ldalaska[1]);
      context.lineTo(llalaska[0], llalaska[1]);
      context.closePath();

      context.moveTo(ulpuertoRico[0], ulpuertoRico[1]);
      context.lineTo(urpuertoRico[0], urpuertoRico[1]);
      context.lineTo(ldpuertoRico[0], ldpuertoRico[1]);
      context.lineTo(ldpuertoRico[0], ldpuertoRico[1]);
      context.lineTo(llpuertoRico[0], llpuertoRico[1]);
      context.closePath();

      context.moveTo(ulsamoa[0], ulsamoa[1]);
      context.lineTo(ursamoa[0], ursamoa[1]);
      context.lineTo(ldsamoa[0], ldsamoa[1]);
      context.lineTo(ldsamoa[0], ldsamoa[1]);
      context.lineTo(llsamoa[0], llsamoa[1]);
      context.closePath();

      context.moveTo(ulguam[0], ulguam[1]);
      context.lineTo(urguam[0], urguam[1]);
      context.lineTo(ldguam[0], ldguam[1]);
      context.lineTo(ldguam[0], ldguam[1]);
      context.lineTo(llguam[0], llguam[1]);
      context.closePath();

    };
    albersUsa.getCompositionBorders = function() {
      var context = d3Path.path();
      this.drawCompositionBorders(context);
      return context.toString();

    };


    return albersUsa.scale(1070);
  }

  // The projections must have mutually exclusive clip regions on the sphere,
  // as this will avoid emitting interleaving lines and polygons.
  function multiplex$2(streams) {
    var n = streams.length;
    return {
      point: function(x, y) { var i = -1; while (++i < n) {streams[i].point(x, y); }},
      sphere: function() { var i = -1; while (++i < n) {streams[i].sphere(); }},
      lineStart: function() { var i = -1; while (++i < n) {streams[i].lineStart(); }},
      lineEnd: function() { var i = -1; while (++i < n) {streams[i].lineEnd(); }},
      polygonStart: function() { var i = -1; while (++i < n) {streams[i].polygonStart(); }},
      polygonEnd: function() { var i = -1; while (++i < n) {streams[i].polygonEnd(); }}
    };
  }

  // A composite projection for Spain, configured by default for 960×500.
  function conicConformalSpain() {
    var cache,
        cacheStream,

        iberianPeninsule = d3Geo.geoConicConformal().rotate([5, -38.6]).parallels([0,60]), iberianPeninsulePoint,
        canaryIslands = d3Geo.geoConicConformal().rotate([5, -38.6]).parallels([0,60]), canaryIslandsPoint,

        point, pointStream = {point: function(x, y) { point = [x, y]; }};

        /*
        var iberianPeninsuleBbox = [[-11, 46], [4, 35]];
        var canaryIslandsBbox = [[-19.0, 28.85], [-12.7, 28.1]];
        */

    function conicConformalSpain(coordinates) {
      var x = coordinates[0], y = coordinates[1];
      return point = null,
          (iberianPeninsulePoint.point(x, y), point) ||
          (canaryIslandsPoint.point(x, y), point);
    }

    conicConformalSpain.invert = function(coordinates) {
      var k = iberianPeninsule.scale(),
          t = iberianPeninsule.translate(),
          x = (coordinates[0] - t[0]) / k,
          y = (coordinates[1] - t[1]) / k;
          /*
          //How are the return values calculated:
          var c0 = canaryIslands(canaryIslandsBbox[0]);
          var x0 = (c0[0] - t[0]) / k;
          var y0 = (c0[1] - t[1]) / k;

          console.info("p0 canary islands", x0 + ' - ' + y0);


          var c1 = canaryIslands(canaryIslandsBbox[1]);
          var x1 = (c1[0] - t[0]) / k;
          var y1 = (c1[1] - t[1]) / k;

          console.info("p1 canary islands", x1 + ' - ' + y1);
          */
          return (y >= 0.05346 && y< 0.0897 && x >= -0.13388 && x < -0.0322 ? canaryIslands
              : iberianPeninsule).invert(coordinates);
    };

    conicConformalSpain.stream = function(stream) {
      return cache && cacheStream === stream ? cache : cache = multiplex$2([iberianPeninsule.stream(cacheStream = stream), canaryIslands.stream(stream)]);
    };

    conicConformalSpain.precision = function(_) {
      if (!arguments.length) {return iberianPeninsule.precision();}
      iberianPeninsule.precision(_);
      canaryIslands.precision(_);
      return conicConformalSpain;
    };

    conicConformalSpain.scale = function(_) {
      if (!arguments.length) {return iberianPeninsule.scale();}
      iberianPeninsule.scale(_);
      canaryIslands.scale(_);
      return conicConformalSpain.translate(iberianPeninsule.translate());
    };

    conicConformalSpain.translate = function(_) {
      if (!arguments.length) {return iberianPeninsule.translate();}
      var k = iberianPeninsule.scale(), x = +_[0], y = +_[1];
      /*
      var c0 = iberianPeninsule(iberianPeninsuleBbox[0]);
     var x0 = (x - c0[0]) / k;
     var y0 = (y - c0[1]) / k;

     var c1 = iberianPeninsule(iberianPeninsuleBbox[1]);
     var x1 = (x - c1[0]) / k;
     var y1 = (y - c1[1]) / k;

     console.info('Iberian Peninsula: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);

     c0 = canaryIslands.translate([x + 0.1 * k, y - 0.094 * k])(canaryIslandsBbox[0]);
     x0 = (x - c0[0]) / k;
     y0 = (y - c0[1]) / k;

     c1 = canaryIslands.translate([x + 0.1 * k, y - 0.094 * k])(canaryIslandsBbox[1]);
     x1 = (x - c1[0]) / k;
     y1 = (y - c1[1]) / k;

     console.info('Canry Islands: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);
     */
      iberianPeninsulePoint = iberianPeninsule
          .translate(_)
          .clipExtent([[x - 0.06857 * k, y - 0.1288 * k],[x + 0.13249 * k, y + 0.05292 * k]])
          .stream(pointStream);

      canaryIslandsPoint = canaryIslands
          .translate([x + 0.1 * k, y - 0.094 * k])
          .clipExtent([[x - 0.1331 * k + epsilon, y + 0.053457 * k + epsilon],[x  - 0.0354 * k - epsilon, y + 0.08969 * k - epsilon]])
          .stream(pointStream);

      return conicConformalSpain;
    };

    conicConformalSpain.drawCompositionBorders = function(context) {
      /*
      console.info("CLIP EXTENT: ", canaryIslands.clipExtent());
      console.info("UL BBOX:", iberianPeninsule.invert([canaryIslands.clipExtent()[0][0], canaryIslands.clipExtent()[0][1]]));
      console.info("UR BBOX:", iberianPeninsule.invert([canaryIslands.clipExtent()[1][0], canaryIslands.clipExtent()[0][1]]));
      console.info("LD BBOX:", iberianPeninsule.invert([canaryIslands.clipExtent()[1][0], canaryIslands.clipExtent()[1][1]]));
      */

      var ulCanaryIslands = iberianPeninsule([-14.0346750522884, 34.96500729877966]);
      var urCanaryIslands = iberianPeninsule([-7.4208899681602025, 35.53698899616862]);
      var ldCanaryIslands = iberianPeninsule([-7.314827535125545, 33.54359498636456]);

      context.moveTo(ulCanaryIslands[0], ulCanaryIslands[1]);
      context.lineTo(urCanaryIslands[0], urCanaryIslands[1]);
      context.lineTo(ldCanaryIslands[0], ldCanaryIslands[1]);
    };
    conicConformalSpain.getCompositionBorders = function() {
      var context = d3Path.path();
      this.drawCompositionBorders(context);
      return context.toString();
    };

    return conicConformalSpain.scale(2700);
  }

  // The projections must have mutually exclusive clip regions on the sphere,
  // as this will avoid emitting interleaving lines and polygons.
  function multiplex$3(streams) {
    var n = streams.length;
    return {
      point: function(x, y) { var i = -1; while (++i < n) {streams[i].point(x, y); }},
      sphere: function() { var i = -1; while (++i < n) {streams[i].sphere(); }},
      lineStart: function() { var i = -1; while (++i < n) {streams[i].lineStart(); }},
      lineEnd: function() { var i = -1; while (++i < n) {streams[i].lineEnd(); }},
      polygonStart: function() { var i = -1; while (++i < n) {streams[i].polygonStart(); }},
      polygonEnd: function() { var i = -1; while (++i < n) {streams[i].polygonEnd(); }}
    };
  }

  // A composite projection for Portugal, configured by default for 960×500.
  function conicConformalPortugal() {
    var cache,
        cacheStream,
        iberianPeninsule = d3Geo.geoConicConformal().rotate([10, -39.3]).parallels([0, 60]), iberianPeninsulePoint,
        madeira = d3Geo.geoConicConformal().rotate([17, -32.7]).parallels([0, 60]), madeiraPoint,
        azores = d3Geo.geoConicConformal().rotate([27.8, -38.6]).parallels([0, 60]), azoresPoint,

        point, pointStream = {point: function(x, y) { point = [x, y]; }};

        /*
        var iberianPeninsuleBbox = [[-11, 46], [4, 34]];
        var madeiraBbox = [[-17.85, 33.6], [-16, 32.02]];
        var azoresBbox = [[-32, 40.529], [-23.98, 35.75]];
        */


    function conicConformalPortugal(coordinates) {
      var x = coordinates[0], y = coordinates[1];
      return point = null,
          (iberianPeninsulePoint.point(x, y), point) ||
          (madeiraPoint.point(x, y), point) ||
          (azoresPoint.point(x, y), point);
    }

    conicConformalPortugal.invert = function(coordinates) {
      var k = iberianPeninsule.scale(),
          t = iberianPeninsule.translate(),
          x = (coordinates[0] - t[0]) / k,
          y = (coordinates[1] - t[1]) / k;

          /*
          //How are the return values calculated:
          console.info("******");
          var c0 = madeira(madeiraBbox[0]);
          var x0 = (c0[0] - t[0]) / k;
          var y0 = (c0[1] - t[1]) / k;

          console.info("p0 madeira", x0 + ' - ' + y0);

          var c1 = madeira(madeiraBbox[1]);
          var x1 = (c1[0] - t[0]) / k;
          var y1 = (c1[1] - t[1]) / k;

          console.info("p1 madeira", x1 + ' - ' + y1);

          c0 = azores(azoresBbox[0]);
          x0 = (c0[0] - t[0]) / k;
          y0 = (c0[1] - t[1]) / k;

          console.info("p0 azores", x0 + ' - ' + y0);

          c1 = azores(azoresBbox[1]);
          x1 = (c1[0] - t[0]) / k;
          y1 = (c1[1] - t[1]) / k;

          console.info("p1 azores", x1 + ' - ' + y1);
          */

          return (y >= 0.0093 && y< 0.03678 && x >= -0.03875 && x < -0.0116 ? madeira
              : y >= -0.0412 && y< 0.0091 && x >= -0.07782 && x < -0.01166 ? azores
              : iberianPeninsule).invert(coordinates);
    };

    conicConformalPortugal.stream = function(stream) {
      return cache && cacheStream === stream ? cache : cache = multiplex$3([iberianPeninsule.stream(cacheStream = stream), madeira.stream(stream), azores.stream(stream)]);
    };

    conicConformalPortugal.precision = function(_) {
      if (!arguments.length) {return iberianPeninsule.precision();}
      iberianPeninsule.precision(_);
      madeira.precision(_);
      azores.precision(_);
      return conicConformalPortugal;
    };

    conicConformalPortugal.scale = function(_) {
      if (!arguments.length) {return iberianPeninsule.scale();}
      iberianPeninsule.scale(_);
      madeira.scale(_);
      azores.scale(_ * 0.6);
      return conicConformalPortugal.translate(iberianPeninsule.translate());
    };

    conicConformalPortugal.translate = function(_) {
      if (!arguments.length) {return iberianPeninsule.translate();}
      var k = iberianPeninsule.scale(), x = +_[0], y = +_[1];
      /*
      var c0 = iberianPeninsule(iberianPeninsuleBbox[0]);
     var x0 = (x - c0[0]) / k;
     var y0 = (y - c0[1]) / k;

     var c1 = iberianPeninsule(iberianPeninsuleBbox[1]);
     var x1 = (x - c1[0]) / k;
     var y1 = (y - c1[1]) / k;

     console.info('Iberian Peninsula: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);
     console.info('.clipExtent([[x '+
      (x0<0?'+ ':'- ') + Math.abs(x0.toFixed(4))+
      ' * k, y '+
      (y0<0?'+ ':'- ') + Math.abs(y0.toFixed(4))+
      ' * k],[x '+
      (x1<0?'+ ':'- ') + Math.abs(x1.toFixed(4))+
      ' * k, y '+
      (y1<0?'+ ':'- ') + Math.abs(y1.toFixed(4))+
      ' * k]])');

     c0 = madeira.translate([x - 0.0265 * k, y + 0.025 * k])(madeiraBbox[0]);
     x0 = (x - c0[0]) / k;
     y0 = (y - c0[1]) / k;

     c1 = madeira.translate([x - 0.0265 * k, y + 0.025 * k])(madeiraBbox[1]);
     x1 = (x - c1[0]) / k;
     y1 = (y - c1[1]) / k;

     console.info('Madeira: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);
     console.info('.clipExtent([[x '+
      (x0<0?'+ ':'- ') + Math.abs(x0.toFixed(4))+
      ' * k + epsilon, y '+
      (y0<0?'+ ':'- ') + Math.abs(y0.toFixed(4))+
      ' * k + epsilon],[x '+
      (x1<0?'+ ':'- ') + Math.abs(x1.toFixed(4))+
      ' * k - epsilon, y '+
      (y1<0?'+ ':'- ') + Math.abs(y1.toFixed(4))+
      ' * k - epsilon]])');

      c0 = azores.translate([x - 0.045 * k, y + -0.02 * k])(azoresBbox[0]);
      x0 = (x - c0[0]) / k;
      y0 = (y - c0[1]) / k;

      c1 = azores.translate([x - 0.045 * k, y + -0.02 * k])(azoresBbox[1]);
      x1 = (x - c1[0]) / k;
      y1 = (y - c1[1]) / k;

      console.info('Azores: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);
      console.info('.clipExtent([[x '+
       (x0<0?'+ ':'- ') + Math.abs(x0.toFixed(4))+
       ' * k + epsilon, y '+
       (y0<0?'+ ':'- ') + Math.abs(y0.toFixed(4))+
       ' * k + epsilon],[x '+
       (x1<0?'+ ':'- ') + Math.abs(x1.toFixed(4))+
       ' * k - epsilon, y '+
       (y1<0?'+ ':'- ') + Math.abs(y1.toFixed(4))+
       ' * k - epsilon]])');
       */
      iberianPeninsulePoint = iberianPeninsule
          .translate(_)
          .clipExtent([[x - 0.0115 * k, y - 0.1138 * k],[x +0.2105 * k, y +0.0673 * k]])
          .stream(pointStream);


      madeiraPoint = madeira
          .translate([x - 0.0265 * k, y + 0.025 * k])
          .clipExtent([[x - 0.0388 * k + epsilon, y + 0.0093 * k + epsilon],[x - 0.0116 * k - epsilon, y + 0.0368 * k - epsilon]])
          .stream(pointStream);

      azoresPoint = azores
          .translate([x - 0.045 * k, y + -0.02 * k])
          .clipExtent([[x - 0.0778 * k + epsilon, y - 0.0413 * k + epsilon],[x - 0.0117 * k - epsilon, y + 0.0091 * k - epsilon]])
          .stream(pointStream);

      return conicConformalPortugal;
    };

    conicConformalPortugal.drawCompositionBorders = function(context) {
      /*
      console.info("CLIP EXTENT MADEIRA: ", madeira.clipExtent());
      console.info("UL BBOX:", iberianPeninsule.invert([madeira.clipExtent()[0][0], madeira.clipExtent()[0][1]]));
      console.info("UR BBOX:", iberianPeninsule.invert([madeira.clipExtent()[1][0], madeira.clipExtent()[0][1]]));
      console.info("LD BBOX:", iberianPeninsule.invert([madeira.clipExtent()[1][0], madeira.clipExtent()[1][1]]));
      console.info("LL BBOX:", iberianPeninsule.invert([madeira.clipExtent()[0][0], madeira.clipExtent()[1][1]]));

      console.info("CLIP EXTENT AZORES: ", azores.clipExtent());
      console.info("UL BBOX:", iberianPeninsule.invert([azores.clipExtent()[0][0], azores.clipExtent()[0][1]]));
      console.info("UR BBOX:", iberianPeninsule.invert([azores.clipExtent()[1][0], azores.clipExtent()[0][1]]));
      console.info("LD BBOX:", iberianPeninsule.invert([azores.clipExtent()[1][0], azores.clipExtent()[1][1]]));
      console.info("LL BBOX:", iberianPeninsule.invert([azores.clipExtent()[0][0], azores.clipExtent()[1][1]]));
      */

      var ulmadeira = iberianPeninsule([-12.8351, 38.7113]);
      var urmadeira = iberianPeninsule([-10.8482, 38.7633]);
      var ldmadeira = iberianPeninsule([-10.8181, 37.2072]);
      var llmadeira = iberianPeninsule([-12.7345, 37.1573]);

      var ulazores = iberianPeninsule([-16.0753, 41.4436]);
      var urazores = iberianPeninsule([-10.9168, 41.6861]);
      var ldazores = iberianPeninsule([-10.8557, 38.7747]);
      var llazores = iberianPeninsule([-15.6728, 38.5505]);

      context.moveTo(ulmadeira[0], ulmadeira[1]);
      context.lineTo(urmadeira[0], urmadeira[1]);
      context.lineTo(ldmadeira[0], ldmadeira[1]);
      context.lineTo(ldmadeira[0], ldmadeira[1]);
      context.lineTo(llmadeira[0], llmadeira[1]);
      context.closePath();

      context.moveTo(ulazores[0], ulazores[1]);
      context.lineTo(urazores[0], urazores[1]);
      context.lineTo(ldazores[0], ldazores[1]);
      context.lineTo(ldazores[0], ldazores[1]);
      context.lineTo(llazores[0], llazores[1]);
      context.closePath();

    };
    conicConformalPortugal.getCompositionBorders = function() {
      var context = d3Path.path();
      this.drawCompositionBorders(context);
      return context.toString();
    };

    return conicConformalPortugal.scale(4200);
  }

  // The projections must have mutually exclusive clip regions on the sphere,
  // as this will avoid emitting interleaving lines and polygons.
  function multiplex$4(streams) {
    var n = streams.length;
    return {
      point: function(x, y) { var i = -1; while (++i < n) {streams[i].point(x, y); }},
      sphere: function() { var i = -1; while (++i < n) {streams[i].sphere(); }},
      lineStart: function() { var i = -1; while (++i < n) {streams[i].lineStart(); }},
      lineEnd: function() { var i = -1; while (++i < n) {streams[i].lineEnd(); }},
      polygonStart: function() { var i = -1; while (++i < n) {streams[i].polygonStart(); }},
      polygonEnd: function() { var i = -1; while (++i < n) {streams[i].polygonEnd(); }}
    };
  }

  // A composite projection for Ecuador, configured by default for 960×500.
  function mercatorEcuador() {
    var cache,
        cacheStream,

        mainland = d3Geo.geoMercator().rotate([80, 1.5]), mainlandPoint,
        galapagos = d3Geo.geoMercator().rotate([90.73, 1]), galapagosPoint,

        point, pointStream = {point: function(x, y) { point = [x, y]; }};

        /*
        var mainlandBbox = [[-81.5, 2.7], [-70.0, -6.0]];
        var galapagosBbox = [[-92.2, 0.58], [-88.8, -1.8]];
        */

    function mercatorEcuador(coordinates) {
      var x = coordinates[0], y = coordinates[1];
      return point = null,
          (mainlandPoint.point(x, y), point) ||
          (galapagosPoint.point(x, y), point);
    }

    mercatorEcuador.invert = function(coordinates) {
      var k = mainland.scale(),
          t = mainland.translate(),
          x = (coordinates[0] - t[0]) / k,
          y = (coordinates[1] - t[1]) / k;
          /*
          //How are the return values calculated:
          var c0 = galapagos(galapagosBbox[0]);
          var x0 = (c0[0] - t[0]) / k;
          var y0 = (c0[1] - t[1]) / k;

          console.info("p0 galapagos", x0 + ' - ' + y0);


          var c1 = galapagos(galapagosBbox[1]);
          var x1 = (c1[0] - t[0]) / k;
          var y1 = (c1[1] - t[1]) / k;

          console.info("p1 galapagos", x1 + ' - ' + y1);
          */
          return (y >= -0.0676 && y< -0.026 && x >= -0.0857 && x < -0.0263 ? galapagos
              : mainland).invert(coordinates);
    };

    mercatorEcuador.stream = function(stream) {
      return cache && cacheStream === stream ? cache : cache = multiplex$4([mainland.stream(cacheStream = stream), galapagos.stream(stream)]);
    };

    mercatorEcuador.precision = function(_) {
      if (!arguments.length) {return mainland.precision();}
      mainland.precision(_);
      galapagos.precision(_);
      return mercatorEcuador;
    };

    mercatorEcuador.scale = function(_) {
      if (!arguments.length) {return mainland.scale();}
      mainland.scale(_);
      galapagos.scale(_);
      return mercatorEcuador.translate(mainland.translate());
    };

    mercatorEcuador.translate = function(_) {
      if (!arguments.length) {return mainland.translate();}
      var k = mainland.scale(), x = +_[0], y = +_[1];
      /*
      var c0 = mainland(mainlandBbox[0]);
     var x0 = (x - c0[0]) / k;
     var y0 = (y - c0[1]) / k;

     var c1 = mainland(mainlandBbox[1]);
     var x1 = (x - c1[0]) / k;
     var y1 = (y - c1[1]) / k;

     console.info('mainland: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);
     console.info('.clipExtent([[x '+
      (x0<0?'+ ':'- ') + Math.abs(x0.toFixed(4))+
      ' * k, y '+
      (y0<0?'+ ':'- ') + Math.abs(y0.toFixed(4))+
      ' * k],[x '+
      (x1<0?'+ ':'- ') + Math.abs(x1.toFixed(4))+
      ' * k, y '+
      (y1<0?'+ ':'- ') + Math.abs(y1.toFixed(4))+
      ' * k]])');

     c0 = galapagos.translate([x - 0.06 * k, y - 0.04 * k])(galapagosBbox[0]);
     x0 = (x - c0[0]) / k;
     y0 = (y - c0[1]) / k;

     c1 = galapagos.translate([x - 0.06 * k, y - 0.04 * k])(galapagosBbox[1]);
     x1 = (x - c1[0]) / k;
     y1 = (y - c1[1]) / k;

     console.info('galapagos: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);
     console.info('.clipExtent([[x '+
      (x0<0?'+ ':'- ') + Math.abs(x0.toFixed(4))+
      ' * k + epsilon, y '+
      (y0<0?'+ ':'- ') + Math.abs(y0.toFixed(4))+
      ' * k + epsilon],[x '+
      (x1<0?'+ ':'- ') + Math.abs(x1.toFixed(4))+
      ' * k - epsilon, y '+
      (y1<0?'+ ':'- ') + Math.abs(y1.toFixed(4))+
      ' * k - epsilon]])');*/

      mainlandPoint = mainland
          .translate(_)
          .clipExtent([[x - 0.0262 * k, y - 0.0734 * k],[x + 0.1741 * k, y + 0.079 * k]])
          .stream(pointStream);

      galapagosPoint = galapagos
          .translate([x - 0.06 * k, y - 0.04 * k])
          .clipExtent([[x - 0.0857 * k + epsilon, y - 0.0676 * k + epsilon],[x - 0.0263 * k - epsilon, y - 0.026 * k - epsilon]])
          .stream(pointStream);

      return mercatorEcuador;
    };

    mercatorEcuador.drawCompositionBorders = function(context) {
      /*
      console.info("CLIP EXTENT: ", galapagos.clipExtent());
      console.info("UL BBOX:", mainland.invert([galapagos.clipExtent()[0][0], galapagos.clipExtent()[0][1]]));
      console.info("UR BBOX:", mainland.invert([galapagos.clipExtent()[1][0], galapagos.clipExtent()[0][1]]));
      console.info("LD BBOX:", mainland.invert([galapagos.clipExtent()[1][0], galapagos.clipExtent()[1][1]]));
      console.info("LL BBOX:", mainland.invert([galapagos.clipExtent()[0][0], galapagos.clipExtent()[1][1]]));
      */

      var ulgalapagos = mainland([-84.9032, 2.3757]);
      var urgalapagos = mainland([-81.5047, 2.3708]);
      var ldgalapagos = mainland([-81.5063, -0.01]);
      var llgalapagos = mainland([-84.9086, -0.005]);

      context.moveTo(ulgalapagos[0], ulgalapagos[1]);
      context.lineTo(urgalapagos[0], urgalapagos[1]);
      context.lineTo(ldgalapagos[0], ldgalapagos[1]);
      context.lineTo(llgalapagos[0], llgalapagos[1]);
      context.closePath();

    };
    mercatorEcuador.getCompositionBorders = function() {
      var context = d3Path.path();
      this.drawCompositionBorders(context);
      return context.toString();
    };

    return mercatorEcuador.scale(3500);
  }

  // The projections must have mutually exclusive clip regions on the sphere,
  // as this will avoid emitting interleaving lines and polygons.
  function multiplex$5(streams) {
    var n = streams.length;
    return {
      point: function(x, y) { var i = -1; while (++i < n) {streams[i].point(x, y); }},
      sphere: function() { var i = -1; while (++i < n) {streams[i].sphere(); }},
      lineStart: function() { var i = -1; while (++i < n) {streams[i].lineStart(); }},
      lineEnd: function() { var i = -1; while (++i < n) {streams[i].lineEnd(); }},
      polygonStart: function() { var i = -1; while (++i < n) {streams[i].polygonStart(); }},
      polygonEnd: function() { var i = -1; while (++i < n) {streams[i].polygonEnd(); }}
    };
  }

  // A composite projection for Chile, configured by default for 960×500.
  function transverseMercatorChile() {
    var cache,
        cacheStream,
        mainland = d3Geo.geoTransverseMercator().rotate([72, 37]), mainlandPoint,
        antarctic = d3Geo.geoStereographic().rotate([72, 0]), antarcticPoint,
        juanFernandez = d3Geo.geoMercator().rotate([80, 33.5]), juanFernandezPoint,
        pascua = d3Geo.geoMercator().rotate([110, 25]), pascuaPoint,

        point, pointStream = {point: function(x, y) { point = [x, y]; }};

      /*
      var mainlandBbox = [[-75.5, -15.0], [-32, -49.0]];
      var antarcticBbox = [[-91.0, -60.0], [-43.0, -90.0]];
      var juanFernandezBbox = [[-81.0, -33.0], [-78.5, -34.0]];
      var pascuaBbox = [[-110, -26.6], [-108.7, -27.5]];
      */

    function transverseMercatorChile(coordinates) {
      var x = coordinates[0], y = coordinates[1];
      return point = null,
          (mainlandPoint.point(x, y), point) ||
          (antarcticPoint.point(x, y), point) ||
          (juanFernandezPoint.point(x, y), point) ||
          (pascuaPoint.point(x, y), point);
    }

    transverseMercatorChile.invert = function(coordinates) {
      var k = mainland.scale(),
          t = mainland.translate(),
          x = (coordinates[0] - t[0]) / k,
          y = (coordinates[1] - t[1]) / k;

          /*
          //How are the return values calculated:
          console.info("******");
          var c0 = antarctic(antarcticBbox[0]);
          var x0 = (c0[0] - t[0]) / k;
          var y0 = (c0[1] - t[1]) / k;

          console.info("p0 antarctic", x0 + ' - ' + y0);

          var c1 = antarctic(antarcticBbox[1]);
          var x1 = (c1[0] - t[0]) / k;
          var y1 = (c1[1] - t[1]) / k;

          console.info("p1 antarctic", x1 + ' - ' + y1);

          c0 = juanFernandez(juanFernandezBbox[0]);
          x0 = (c0[0] - t[0]) / k;
          y0 = (c0[1] - t[1]) / k;

          console.info("p0 juanFernandez", x0 + ' - ' + y0);

          c1 = juanFernandez(juanFernandezBbox[1]);
          x1 = (c1[0] - t[0]) / k;
          y1 = (c1[1] - t[1]) / k;

          console.info("p1 juanFernandez", x1 + ' - ' + y1);

          c0 = pascua(pascuaBbox[0]);
          x0 = (c0[0] - t[0]) / k;
          y0 = (c0[1] - t[1]) / k;

          console.info("p0 pascua", x0 + ' - ' + y0);

          c1 = pascua(pascuaBbox[1]);
          x1 = (c1[0] - t[0]) / k;
          y1 = (c1[1] - t[1]) / k;

          console.info("p1 pascua", x1 + ' - ' + y1);
          */

          return (y >= 0.2582 && y< 0.32 && x >= -0.1036 && x < -0.087 ? antarctic
              : y >= -0.01298 && y< 0.0133 && x >= -0.11396 && x < -0.05944 ? juanFernandez
              : y >= 0.01539 && y< 0.03911 && x >= -0.089 && x < -0.0588 ? pascua
              : mainland).invert(coordinates);
    };

    transverseMercatorChile.stream = function(stream) {
      return cache && cacheStream === stream ? cache : cache = multiplex$5([mainland.stream(cacheStream = stream), antarctic.stream(stream), juanFernandez.stream(stream), pascua.stream(stream)]);
    };

    transverseMercatorChile.precision = function(_) {
      if (!arguments.length) {return mainland.precision();}
      mainland.precision(_);
      antarctic.precision(_);
      juanFernandez.precision(_);
      pascua.precision(_);
      return transverseMercatorChile;
    };

    transverseMercatorChile.scale = function(_) {
      if (!arguments.length) {return mainland.scale();}
      mainland.scale(_);
      antarctic.scale(_ * 0.15);
      juanFernandez.scale(_ * 1.5);
      pascua.scale(_ * 1.5);
      return transverseMercatorChile.translate(mainland.translate());
    };

    transverseMercatorChile.translate = function(_) {
      if (!arguments.length) {return mainland.translate();}
      var k = mainland.scale(), x = +_[0], y = +_[1];

      /*
      var c0 = mainland(mainlandBbox[0]);
     var x0 = (x - c0[0]) / k;
     var y0 = (y - c0[1]) / k;

     var c1 = mainland(mainlandBbox[1]);
     var x1 = (x - c1[0]) / k;
     var y1 = (y - c1[1]) / k;

     console.info('Mainland: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);
     console.info('.clipExtent([[x '+
      (x0<0?'+ ':'- ') + Math.abs(x0.toFixed(4))+
      ' * k, y '+
      (y0<0?'+ ':'- ') + Math.abs(y0.toFixed(4))+
      ' * k],[x '+
      (x1<0?'+ ':'- ') + Math.abs(x1.toFixed(4))+
      ' * k, y '+
      (y1<0?'+ ':'- ') + Math.abs(y1.toFixed(4))+
      ' * k]])');

     c0 = antarctic.translate([x - 0.1 * k, y + 0.17 * k])(antarcticBbox[0]);
     x0 = (x - c0[0]) / k;
     y0 = (y - c0[1]) / k;

     c1 = antarctic.translate([x - 0.1 * k, y + 0.17 * k])(antarcticBbox[1]);
     x1 = (x - c1[0]) / k;
     y1 = (y - c1[1]) / k;

     console.info('antarctic: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);
     console.info('Doesn t work due to -90 latitude!' + '.clipExtent([[x '+
      (x0<0?'+ ':'- ') + Math.abs(x0.toFixed(4))+
      ' * k + epsilon, y '+
      (y0<0?'+ ':'- ') + Math.abs(y0.toFixed(4))+
      ' * k + epsilon],[x '+
      (x1<0?'+ ':'- ') + Math.abs(x1.toFixed(4))+
      ' * k - epsilon, y '+
      (y1<0?'+ ':'- ') + Math.abs(y1.toFixed(4))+
      ' * k - epsilon]])');

      c0 = juanFernandez.translate([x - 0.092 * k, y -0 * k])(juanFernandezBbox[0]);
      x0 = (x - c0[0]) / k;
      y0 = (y - c0[1]) / k;

      c1 = juanFernandez.translate([x - 0.092 * k, y -0 * k])(juanFernandezBbox[1]);
      x1 = (x - c1[0]) / k;
      y1 = (y - c1[1]) / k;

      console.info('juanFernandez: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);
      console.info('.clipExtent([[x '+
       (x0<0?'+ ':'- ') + Math.abs(x0.toFixed(4))+
       ' * k + epsilon, y '+
       (y0<0?'+ ':'- ') + Math.abs(y0.toFixed(4))+
       ' * k + epsilon],[x '+
       (x1<0?'+ ':'- ') + Math.abs(x1.toFixed(4))+
       ' * k - epsilon, y '+
       (y1<0?'+ ':'- ') + Math.abs(y1.toFixed(4))+
       ' * k - epsilon]])');

       c0 = pascua.translate([x - 0.089 * k, y -0.0265 * k])(pascuaBbox[0]);
       x0 = (x - c0[0]) / k;
       y0 = (y - c0[1]) / k;

       c1 = pascua.translate([x - 0.089 * k, y -0.0265 * k])(pascuaBbox[1]);
       x1 = (x - c1[0]) / k;
       y1 = (y - c1[1]) / k;

       console.info('pascua: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);
       console.info('.clipExtent([[x '+
        (x0<0?'+ ':'- ') + Math.abs(x0.toFixed(4))+
        ' * k + epsilon, y '+
        (y0<0?'+ ':'- ') + Math.abs(y0.toFixed(4))+
        ' * k + epsilon],[x '+
        (x1<0?'+ ':'- ') + Math.abs(x1.toFixed(4))+
        ' * k - epsilon, y '+
        (y1<0?'+ ':'- ') + Math.abs(y1.toFixed(4))+
        ' * k - epsilon]])');
        */
      mainlandPoint = mainland
          .translate(_)
          .clipExtent([[x - 0.059 * k, y - 0.3835 * k],[x + 0.4498 * k, y + 0.3375 * k]])
          .stream(pointStream);

      antarcticPoint = antarctic
          .translate([x - 0.087 * k, y + 0.17 * k])
          .clipExtent([[x - 0.1166 * k + epsilon, y + 0.2582 * k + epsilon],[x - 0.06 * k - epsilon, y + 0.32 * k - epsilon]])
          .stream(pointStream);

      juanFernandezPoint = juanFernandez
          .translate([x - 0.092 * k, y - 0 * k])
          .clipExtent([[x - 0.114 * k + epsilon, y - 0.013 * k + epsilon],[x - 0.0594 * k - epsilon, y + 0.0133 * k - epsilon]])
          .stream(pointStream);

      pascuaPoint = pascua
          .translate([x - 0.089 * k, y - 0.0265 * k])
          .clipExtent([[x - 0.089 * k + epsilon, y + 0.0154 * k + epsilon],[x - 0.0588 * k - epsilon, y + 0.0391 * k - epsilon]])
          .stream(pointStream);

      return transverseMercatorChile;
    };

    transverseMercatorChile.drawCompositionBorders = function(context) {
      /*
      console.info("CLIP EXTENT antarctic: ", antarctic.clipExtent());
      console.info("UL BBOX:", mainland.invert([antarctic.clipExtent()[0][0], antarctic.clipExtent()[0][1]]));
      console.info("UR BBOX:", mainland.invert([antarctic.clipExtent()[1][0], antarctic.clipExtent()[0][1]]));
      console.info("LD BBOX:", mainland.invert([antarctic.clipExtent()[1][0], antarctic.clipExtent()[1][1]]));
      console.info("LL BBOX:", mainland.invert([antarctic.clipExtent()[0][0], antarctic.clipExtent()[1][1]]));

      console.info("CLIP EXTENT juanFernandez: ", juanFernandez.clipExtent());
      console.info("UL BBOX:", mainland.invert([juanFernandez.clipExtent()[0][0], juanFernandez.clipExtent()[0][1]]));
      console.info("UR BBOX:", mainland.invert([juanFernandez.clipExtent()[1][0], juanFernandez.clipExtent()[0][1]]));
      console.info("LD BBOX:", mainland.invert([juanFernandez.clipExtent()[1][0], juanFernandez.clipExtent()[1][1]]));
      console.info("LL BBOX:", mainland.invert([juanFernandez.clipExtent()[0][0], juanFernandez.clipExtent()[1][1]]));

      console.info("CLIP EXTENT pascua: ", pascua.clipExtent());
      console.info("UL BBOX:", mainland.invert([pascua.clipExtent()[0][0], pascua.clipExtent()[0][1]]));
      console.info("UR BBOX:", mainland.invert([pascua.clipExtent()[1][0], pascua.clipExtent()[0][1]]));
      console.info("LD BBOX:", mainland.invert([pascua.clipExtent()[1][0], pascua.clipExtent()[1][1]]));
      console.info("LL BBOX:", mainland.invert([pascua.clipExtent()[0][0], pascua.clipExtent()[1][1]]));
      */

      var ulantarctic = mainland([-82.6999, -51.3043]);
      var urantarctic = mainland([-77.5442, -51.6631]);
      var ldantarctic = mainland([-78.0254, -55.1860]);
      var llantarctic = mainland([-83.6106, -54.7785]);

      var uljuanFernandez = mainland([-80.0638, -35.9840]);
      var urjuanFernandez = mainland([-76.2153, -36.1811]);
      var ldjuanFernandez = mainland([-76.2994, -37.6839]);
      var lljuanFernandez = mainland([-80.2231, -37.4757]);

      var ulpascua = mainland([-78.442, -37.706]);
      var urpascua = mainland([-76.263, -37.8054]);
      var ldpascua = mainland([-76.344, -39.1595]);
      var llpascua = mainland([-78.5638, -39.0559]);

      context.moveTo(ulantarctic[0], ulantarctic[1]);
      context.lineTo(urantarctic[0], urantarctic[1]);
      context.lineTo(ldantarctic[0], ldantarctic[1]);
      context.lineTo(ldantarctic[0], ldantarctic[1]);
      context.lineTo(llantarctic[0], llantarctic[1]);
      context.closePath();

      context.moveTo(uljuanFernandez[0], uljuanFernandez[1]);
      context.lineTo(urjuanFernandez[0], urjuanFernandez[1]);
      context.lineTo(ldjuanFernandez[0], ldjuanFernandez[1]);
      context.lineTo(ldjuanFernandez[0], ldjuanFernandez[1]);
      context.lineTo(lljuanFernandez[0], lljuanFernandez[1]);
      context.closePath();

      context.moveTo(ulpascua[0], ulpascua[1]);
      context.lineTo(urpascua[0], urpascua[1]);
      context.lineTo(ldpascua[0], ldpascua[1]);
      context.lineTo(ldpascua[0], ldpascua[1]);
      context.lineTo(llpascua[0], llpascua[1]);
      context.closePath();


    };
    transverseMercatorChile.getCompositionBorders = function() {
      var context = d3Path.path();
      this.drawCompositionBorders(context);
      return context.toString();
    };

    return transverseMercatorChile.scale(700);
  }

  // The projections must have mutually exclusive clip regions on the sphere,
  // as this will avoid emitting interleaving lines and polygons.
  function multiplex$6(streams) {
    var n = streams.length;
    return {
      point: function(x, y) { var i = -1; while (++i < n) {streams[i].point(x, y); }},
      sphere: function() { var i = -1; while (++i < n) {streams[i].sphere(); }},
      lineStart: function() { var i = -1; while (++i < n) {streams[i].lineStart(); }},
      lineEnd: function() { var i = -1; while (++i < n) {streams[i].lineEnd(); }},
      polygonStart: function() { var i = -1; while (++i < n) {streams[i].polygonStart(); }},
      polygonEnd: function() { var i = -1; while (++i < n) {streams[i].polygonEnd(); }}
    };
  }

  // A composite projection for Portugal, configured by default for 960×500.
  function conicEquidistantJapan() {
    var cache,
        cacheStream,
        mainland = d3Geo.geoConicEquidistant().rotate([-136, -32]).parallels([40, 34]), mainlandPoint, //gis.stackexchange.com/a/73135
        hokkaido = d3Geo.geoConicEquidistant().rotate([-136, -32]).parallels([40, 34]), hokkaidoPoint,
        okinawa = d3Geo.geoConicEquidistant().rotate([-136, -32]).parallels([40, 34]), okinawaPoint,

        point, pointStream = {point: function(x, y) { point = [x, y]; }};

        /*
        var mainlandBbox = [[-11, 46], [4, 34]];
        var hokkaidoBbox = [[-17.85, 33.6], [-16, 32.02]];
        var okinawaBbox = [[-32, 40.529], [-23.98, 35.75]];
        */


    function conicEquidistantJapan(coordinates) {
      var x = coordinates[0], y = coordinates[1];
      return point = null,
          (mainlandPoint.point(x, y), point) ||
          (hokkaidoPoint.point(x, y), point) ||
          (okinawaPoint.point(x, y), point);
    }

    conicEquidistantJapan.invert = function(coordinates) {
      var k = mainland.scale(),
          t = mainland.translate(),
          x = (coordinates[0] - t[0]) / k,
          y = (coordinates[1] - t[1]) / k;

          /*
          //How are the return values calculated:
          console.info("******");
          var c0 = hokkaido(hokkaidoBbox[0]);
          var x0 = (c0[0] - t[0]) / k;
          var y0 = (c0[1] - t[1]) / k;

          console.info("p0 hokkaido", x0 + ' - ' + y0);

          var c1 = hokkaido(hokkaidoBbox[1]);
          var x1 = (c1[0] - t[0]) / k;
          var y1 = (c1[1] - t[1]) / k;

          console.info("p1 hokkaido", x1 + ' - ' + y1);

          c0 = okinawa(okinawaBbox[0]);
          x0 = (c0[0] - t[0]) / k;
          y0 = (c0[1] - t[1]) / k;

          console.info("p0 okinawa", x0 + ' - ' + y0);

          c1 = okinawa(okinawaBbox[1]);
          x1 = (c1[0] - t[0]) / k;
          y1 = (c1[1] - t[1]) / k;

          console.info("p1 okinawa", x1 + ' - ' + y1);
          */

          return (y >= 0.0093 && y< 0.03678 && x >= -0.03875 && x < -0.0116 ? hokkaido
              : y >= -0.0412 && y< 0.0091 && x >= -0.07782 && x < -0.01166 ? okinawa
              : mainland).invert(coordinates);
    };

    conicEquidistantJapan.stream = function(stream) {
      return cache && cacheStream === stream ? cache : cache = multiplex$6([mainland.stream(cacheStream = stream), hokkaido.stream(stream), okinawa.stream(stream)]);
    };

    conicEquidistantJapan.precision = function(_) {
      if (!arguments.length) {return mainland.precision();}
      mainland.precision(_);
      hokkaido.precision(_);
      okinawa.precision(_);
      return conicEquidistantJapan;
    };

    conicEquidistantJapan.scale = function(_) {
      if (!arguments.length) {return mainland.scale();}
      mainland.scale(_);
      hokkaido.scale(_);
      okinawa.scale(_);
      return conicEquidistantJapan.translate(mainland.translate());
    };

    conicEquidistantJapan.translate = function(_) {
      if (!arguments.length) {return mainland.translate();}
      var k = mainland.scale(), x = +_[0], y = +_[1];
      /*
      var c0 = mainland(mainlandBbox[0]);
     var x0 = (x - c0[0]) / k;
     var y0 = (y - c0[1]) / k;

     var c1 = mainland(mainlandBbox[1]);
     var x1 = (x - c1[0]) / k;
     var y1 = (y - c1[1]) / k;

     console.info('Iberian Peninsula: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);
     console.info('.clipExtent([[x '+
      (x0<0?'+ ':'- ') + Math.abs(x0.toFixed(4))+
      ' * k, y '+
      (y0<0?'+ ':'- ') + Math.abs(y0.toFixed(4))+
      ' * k],[x '+
      (x1<0?'+ ':'- ') + Math.abs(x1.toFixed(4))+
      ' * k, y '+
      (y1<0?'+ ':'- ') + Math.abs(y1.toFixed(4))+
      ' * k]])');

     c0 = hokkaido.translate([x - 0.0265 * k, y + 0.025 * k])(hokkaidoBbox[0]);
     x0 = (x - c0[0]) / k;
     y0 = (y - c0[1]) / k;

     c1 = hokkaido.translate([x - 0.0265 * k, y + 0.025 * k])(hokkaidoBbox[1]);
     x1 = (x - c1[0]) / k;
     y1 = (y - c1[1]) / k;

     console.info('hokkaido: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);
     console.info('.clipExtent([[x '+
      (x0<0?'+ ':'- ') + Math.abs(x0.toFixed(4))+
      ' * k + epsilon, y '+
      (y0<0?'+ ':'- ') + Math.abs(y0.toFixed(4))+
      ' * k + epsilon],[x '+
      (x1<0?'+ ':'- ') + Math.abs(x1.toFixed(4))+
      ' * k - epsilon, y '+
      (y1<0?'+ ':'- ') + Math.abs(y1.toFixed(4))+
      ' * k - epsilon]])');

      c0 = okinawa.translate([x - 0.045 * k, y + -0.02 * k])(okinawaBbox[0]);
      x0 = (x - c0[0]) / k;
      y0 = (y - c0[1]) / k;

      c1 = okinawa.translate([x - 0.045 * k, y + -0.02 * k])(okinawaBbox[1]);
      x1 = (x - c1[0]) / k;
      y1 = (y - c1[1]) / k;

      console.info('okinawa: p0: ' + x0 + ', ' + y0 + ' , p1: ' + x1 + ' - ' + y1);
      console.info('.clipExtent([[x '+
       (x0<0?'+ ':'- ') + Math.abs(x0.toFixed(4))+
       ' * k + epsilon, y '+
       (y0<0?'+ ':'- ') + Math.abs(y0.toFixed(4))+
       ' * k + epsilon],[x '+
       (x1<0?'+ ':'- ') + Math.abs(x1.toFixed(4))+
       ' * k - epsilon, y '+
       (y1<0?'+ ':'- ') + Math.abs(y1.toFixed(4))+
       ' * k - epsilon]])');
       */
      mainlandPoint = mainland
          .translate(_)
          //.clipExtent([[x - 0.0115 * k, y - 0.1138 * k],[x +0.2105 * k, y +0.0673 * k]])
          .stream(pointStream);


      hokkaidoPoint = hokkaido
          .translate(_)
          //.translate([x - 0.0265 * k, y + 0.025 * k])
          //.clipExtent([[x - 0.0388 * k + epsilon, y + 0.0093 * k + epsilon],[x - 0.0116 * k - epsilon, y + 0.0368 * k - epsilon]])
          .stream(pointStream);

      okinawaPoint = okinawa
          .translate(_)
          //.translate([x - 0.045 * k, y + -0.02 * k])
          //.clipExtent([[x - 0.0778 * k + epsilon, y - 0.0413 * k + epsilon],[x - 0.0117 * k - epsilon, y + 0.0091 * k - epsilon]])
          .stream(pointStream);

      return conicEquidistantJapan;
    };

    conicEquidistantJapan.drawCompositionBorders = function(context) {
      /*
      console.info("CLIP EXTENT hokkaido: ", hokkaido.clipExtent());
      console.info("UL BBOX:", mainland.invert([hokkaido.clipExtent()[0][0], hokkaido.clipExtent()[0][1]]));
      console.info("UR BBOX:", mainland.invert([hokkaido.clipExtent()[1][0], hokkaido.clipExtent()[0][1]]));
      console.info("LD BBOX:", mainland.invert([hokkaido.clipExtent()[1][0], hokkaido.clipExtent()[1][1]]));
      console.info("LL BBOX:", mainland.invert([hokkaido.clipExtent()[0][0], hokkaido.clipExtent()[1][1]]));

      console.info("CLIP EXTENT okinawa: ", okinawa.clipExtent());
      console.info("UL BBOX:", mainland.invert([okinawa.clipExtent()[0][0], okinawa.clipExtent()[0][1]]));
      console.info("UR BBOX:", mainland.invert([okinawa.clipExtent()[1][0], okinawa.clipExtent()[0][1]]));
      console.info("LD BBOX:", mainland.invert([okinawa.clipExtent()[1][0], okinawa.clipExtent()[1][1]]));
      console.info("LL BBOX:", mainland.invert([okinawa.clipExtent()[0][0], okinawa.clipExtent()[1][1]]));
      */

      var ulhokkaido = mainland([-12.8351, 38.7113]);
      var urhokkaido = mainland([-10.8482, 38.7633]);
      var ldhokkaido = mainland([-10.8181, 37.2072]);
      var llhokkaido = mainland([-12.7345, 37.1573]);

      var ulokinawa = mainland([-16.0753, 41.4436]);
      var urokinawa = mainland([-10.9168, 41.6861]);
      var ldokinawa = mainland([-10.8557, 38.7747]);
      var llokinawa = mainland([-15.6728, 38.5505]);

      context.moveTo(ulhokkaido[0], ulhokkaido[1]);
      context.lineTo(urhokkaido[0], urhokkaido[1]);
      context.lineTo(ldhokkaido[0], ldhokkaido[1]);
      context.lineTo(ldhokkaido[0], ldhokkaido[1]);
      context.lineTo(llhokkaido[0], llhokkaido[1]);
      context.closePath();

      context.moveTo(ulokinawa[0], ulokinawa[1]);
      context.lineTo(urokinawa[0], urokinawa[1]);
      context.lineTo(ldokinawa[0], ldokinawa[1]);
      context.lineTo(ldokinawa[0], ldokinawa[1]);
      context.lineTo(llokinawa[0], llokinawa[1]);
      context.closePath();

    };
    conicEquidistantJapan.getCompositionBorders = function() {
      var context = d3Path.path();
      this.drawCompositionBorders(context);
      return context.toString();
    };

    return conicEquidistantJapan.scale(2200);
  }

  exports.geoAlbersUsa = albersUsa;
  exports.geoAlbersUsaTerritories = albersUsaTerritories;
  exports.geoConicConformalSpain = conicConformalSpain;
  exports.geoConicConformalPortugal = conicConformalPortugal;
  exports.geoMercatorEcuador = mercatorEcuador;
  exports.geoTransverseMercatorChile = transverseMercatorChile;
  exports.geoConicEquidistantJapan = conicEquidistantJapan;

  Object.defineProperty(exports, '__esModule', { value: true });

}));