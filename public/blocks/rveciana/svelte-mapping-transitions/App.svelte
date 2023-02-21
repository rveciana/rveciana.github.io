<script>
  import { geoAlbers, geoPath, geoProjection } from "d3-geo";
  import { geoAlbersUk } from "d3-composite-projections";
  import { scaleLinear } from "d3-scale";
  import { extent } from "d3-array";
  import { onMount } from "svelte";
  import { feature } from "topojson";
  import { tweened } from "svelte/motion";
  import { interpolate } from "d3-interpolate";
  import Feature from "./Feature.svelte";

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

  const projectionAlbersUk = geoAlbersUk()
    .translate([width / 2, (1.85 * height) / 2])
    .scale(5200);

  const projectionTween = (projection0, projection1) => {
    return function(t) {
      function project(λ, φ) {
        (λ *= 180 / Math.PI), (φ *= 180 / Math.PI);
        var p0 = projection0([λ, φ]),
          p1 = projection1([λ, φ]);
        if (!p0 || !p1) return [0, 0];
        return [(1 - t) * p0[0] + t * p1[0], (1 - t) * -p0[1] + t * -p1[1]];
      }

      return geoProjection(project)
        .scale(1)
        .translate([0, 0]);
    };
  };

  const currentProj = tweened(projectionAlbers, {
    duration: 1000,
    interpolate: projectionTween
  });

  $: path = geoPath().projection($currentProj);

  const opacity = tweened(0, {
    duration: 1000
  });

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
  .borders {
    fill: #ddd;
  }
</style>

<button
  on:click={() => {
    currentProj.set($currentProj === projectionAlbers ? projectionAlbersUk : projectionAlbers);
    opacity.set($currentProj === projectionAlbers ? 1 : 0);
  }}>
  Change
</button>
<svg width="960" height="500">
  <path
    class="borders"
    d={projectionAlbersUk.getCompositionBorders()}
    style="opacity: {$opacity}" />
  {#each data as feature}
    <Feature
      featurePath={path(feature)}
      initialColor={colorScale(feature.properties.NAME_2.length)} />
  {/each}

</svg>
