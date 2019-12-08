---
layout: post
title: "svg-path-properties 1.0.0"
date: 2019-12-08
categories: other
tags: [canvas, svg]
teaser: svg-path-properties.png
description: New version for the svg-path-properties library
thumbnail: /images/other/svg-path-properties/twitter.png
twitter-card: summary
---

About three years ago now I made [svg-path-properties][svg-path-properties] while thinking on [drawing labels on isolines on an HTML Canvas element][drawing isolines]. I didn't expect that so many people would use it, so it was written quite fast, with some errors. So I re-wrote it in TypeScript, with better explanations and some examples will be added.

## Version 1.\*

The new version is written in TypeScript, process that showed me several errors and potential bugs. The API is the same with the difference that now the class can be instantiated using _new_, while maintaining the former option too. Both options are valid now, although the first one should be used:

    const properties = new path.svgPathProperties("M0,100 Q50,-50 100,100 T200,100");
    const properties = path.svgPathProperties("M0,100 Q50,-50 100,100 T200,100");

## How to initialize the library

### Using it with node

    const path = require("svg-path-properties");
    const properties = new path.svgPathProperties("M0,100 Q50,-50 100,100 T200,100");

### Including it from an import:

    import { svgPathProperties } from "svg-path-properties";
    const properties = new svgPathProperties("M0,100 Q50,-50 100,100 T200,100");

### Including the script in the browser

Once the script tag has been included,

    const properties = new svgPathProperties.svgPathProperties("M0,100 Q50,-50 100,100 T200,100");

## Methods

First, create ah instance with the svg path as a string:
const properties = new path.svgPathProperties("M0,100 Q50,-50 100,100 T200,100");

The total length of the path can be retrieved:

    const length = properties.getTotalLength();

The position of the path at a given length (in an object of the shape {x: number, y:numebr}) is:

    const point = properties.getPointAtLength(200);

The tangent method gives the angle of the curve at a given length. Useful to draw labels. The object is the same as in the _getPointAtLength_:

    const tangent = properties.getTangentAtLength(200);

_getPropertiesAtLength_ returns the point position and the tangent at the same time. Returns an object like {x: number; y: number; tangentX: number; tangentY: number;}:

    const allProperties = properties.getPropertiesAtLength(200);

This last function returns an array with the different parts of the svg path. The curves can have many functions and it's difficult to see when is starting one or another. The methods returns an object like:

    PartProperties {
        start: Point;
        end: Point;
        length: number;
        getPointAtLength(pos: number): Point;
        getTangentAtLength(pos: number): Point;
        getPropertiesAtLength(pos: number): PointProperties;
    }

    const parts = properties.getParts();

## Links

- [svg-path-properties library][svg-path-properties]
- [Drawing labels on isolines on an HTML Canvas element][drawing isolines]

[svg-path-properties]: https://github.com/rveciana/svg-path-properties
[drawing isolines]: http://bl.ocks.org/rveciana/bef48021e38a77a520109d2088bff9eb
