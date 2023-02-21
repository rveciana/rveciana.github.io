This block shows how to use the [d3-composite-projections](http://rveciana.github.io/d3-composite-projections/) with the [version 5 of d3js](https://github.com/d3/d3/releases/tag/v5.0.0-rc.1).

The only change is the json request, that adds a *then* function instead of returning the data directly.

So this:
```javascript
d3.json("malaysia.json", function(error, malaysia) {
```

Becomes this:

```javascript
d3.json("malaysia.json").then(function(malaysia) {
```

The library works exactly the same way! Changes won't bring the same job as in the v3 to v4.