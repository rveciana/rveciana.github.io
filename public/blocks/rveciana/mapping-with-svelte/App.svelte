<script>
  import { geoAlbers, geoPath } from "d3-geo";
  import { onMount } from "svelte";
  import { feature } from "topojson";
  let data;
  const projection = geoAlbers();
  const path = geoPath().projection(projection);

  onMount(async function() {
    const response = await fetch(
      "https://gist.githubusercontent.com/rveciana/a2a1c21ca1c71cd3ec116cc911e5fce9/raw/79564dfa2c56745ebd62f5655a6cc19d2cffa1ea/us.json"
    );
    const json = await response.json();
    const land = feature(json, json.objects.land);
    data = path(land);
  });
</script>

<style>
  svg {
    width: 960px;
    height: 500px;
  }
  .border {
    stroke: #444444;
    fill: #cccccc;
  }
</style>

<svg width="960" height="500">
  <path d={data} class="border" />
</svg>
