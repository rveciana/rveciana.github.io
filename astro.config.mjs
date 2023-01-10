import { defineConfig } from "astro/config";

// https://astro.build/config
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  site: "https://geoexamples.com",
  markdown: {
    shikiConfig: {
      theme: "github-light",
      langs: [
        "js",
        "ts",
        "python",
        "java",
        "bash",
        "json",
        "ruby",
        "sql",
        "yaml",
      ],
      wrap: true,
    },
  },
  integrations: [mdx()],
});
