<script>
  import { tweened } from "svelte/motion";
  import { interpolateLab } from "d3-interpolate";
  import { rgb } from "d3-color";
  export let featurePath;
  export let initialColor;

  const color = tweened(initialColor, {
    duration: 300,
    interpolate: interpolateLab
  });
</script>

<style>
  .provinceShape {
    stroke: #444444;
    stroke-width: 0.5;
  }
</style>

<path
  d={featurePath}
  class="provinceShape"
  fill={$color}
  on:mouseover={() => {
    color.set(rgb(initialColor).brighter(0.3));
  }}
  on:mouseout={() => {
    color.set(initialColor);
  }} />
