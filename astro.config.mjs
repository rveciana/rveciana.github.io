import { defineConfig } from "astro/config";

// https://astro.build/config
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  markdown: {
    shikiConfig: {
      theme: "github-light",
      langs: ["js", "ts", "python", "java", "bash", "json", "css"],
      wrap: true,
    },
  },
  integrations: [mdx()],
});
