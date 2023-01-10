import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

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
