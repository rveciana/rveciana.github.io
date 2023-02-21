
import { geoConicConformalSpain } from "d3-composite-projections";
import { geoPath } from "d3-geo";
import { json } from "d3-request";
import { select } from "d3-selection";
import { transition } from "d3-transition";
import { feature } from "topojson";

export default {
  geoConicConformalSpain: geoConicConformalSpain,
  geoPath: geoPath,
  json: json,
  select: select,
  transition: transition,
  feature: feature
};
