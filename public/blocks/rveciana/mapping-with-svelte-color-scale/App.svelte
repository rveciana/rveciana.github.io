<script>
  import { geoAlbers, geoPath } from "d3-geo";
  import { scaleLinear } from "d3-scale";
  import { extent } from "d3-array";
  import { onMount } from "svelte";
  import { feature } from "topojson";
  let data = [];
  let colorScale = () => {};
  const width = "960";
  const height = "500";
  const projectionAlbers = geoAlbers()
    .rotate([4.4, 0.8])
    .center([0, 55.4])
    .parallels([50, 60])
    .scale(3800)
    .translate([width / 2, (1.8 * height) / 2]);

  let currentProj = projectionAlbers;
  let path = geoPath().projection(currentProj);

  onMount(async function() {
    const response = await fetch(
      "https://gist.githubusercontent.com/rveciana/27272a581e975835aaa321ddf816d726/raw/c40062a328843322208b8e98c2104dc8f6ad5301/uk-counties.json"
    );
    const json = await response.json();
    const topoData = feature(json, json.objects.UK);
    const land = {
      ...topoData,
      features: topoData.features.filter(
        d => d.properties.NAME_1 === "Scotland"
      )
    };

    const namesExtent = extent(land.features, d => d.properties.NAME_2.length);
    colorScale = scaleLinear()
      .domain(namesExtent)
      .range(["#feedde", "#fd8d3c"]);
    data = land.features;
  });
</script>

<style>
  svg {
    width: 960px;
    height: 500px;
    background-color: "#eeeeee";
  }
  .provinceShape {
    stroke: #444444;
    stroke-width: 0.5;
  }
</style>

<svg width="960" height="500">
  {#each data as feature}
    <path
      d={path(feature)}
      class="provinceShape"
      fill={colorScale(feature.properties.NAME_2.length)} />
  {/each}
</svg>
