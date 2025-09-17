import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import remarkPicture from "./plugins/remark-picture.js";

export default defineConfig({
  site: "https://geoexamples.com",
  base: "/",
  markdown: {
    remarkPlugins: [remarkPicture],
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
