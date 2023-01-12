import rss from "@astrojs/rss";
import type { MarkdownInstance } from "astro";
import config from "../config.json";
import type { Frontmatter } from "../model";

export const get = async () => {
  const postImportResult = import.meta.glob<MarkdownInstance<Frontmatter>>(
    "../pages/*/*.m*",
    {
      eager: true,
    }
  );
  const postsLists = Object.values(postImportResult);
  const posts = postsLists
    .sort(
      (a, b) =>
        new Date(b.frontmatter.pubDate).valueOf() -
        new Date(a.frontmatter.pubDate).valueOf()
    )
    .slice(0, 10)
    .map((post) => ({
      link: post.url ?? "",
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      pubDate: new Date(post.frontmatter.pubDate),
    }));

  return rss({
    title: config.title,
    description: config.description,
    site: config.url,
    items: posts,
    stylesheet: "/styles.xsl",
  });
};
