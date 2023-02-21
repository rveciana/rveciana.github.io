Example to ilustrate [this question at gis.stackoverflow](https://gis.stackexchange.com/questions/290438/turfjs-intersect-line-and-polygon).

The solution is using a combination of [lineIntersect](http://turfjs.org/docs/#lineIntersect) and [lineSlice](http://turfjs.org/docs/#lineSlice). The first one gives the points where the line and the polygon intersect. The second takes the part of the polyline btween the two points.

If the result is more complex (i.e. the resulting intersection is a polyline), the algorithm should be repeated for each part in the polygon.
