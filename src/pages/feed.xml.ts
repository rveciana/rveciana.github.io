import rss from "@astrojs/rss";
import type { MarkdownInstance } from "astro";
import config from "../config.json";
import type { Frontmatter } from "../model";

export const get = () => {
  return rss({
    title: config.title,
    description: config.description,
    site: config.url,
    items: import.meta.glob<MarkdownInstance<Frontmatter>>("../pages/*/*.m*"),
  });
};

//   Object.values(allPosts).forEach(async (getInfo) => {
//     const { url, frontmatter } = await getInfo();
//     console.log(frontmatter);
