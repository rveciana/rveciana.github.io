import rss, { pagesGlobToRssItems } from "@astrojs/rss";
import type { MarkdownInstance } from "astro";
import config from "../config.json";
import type { Frontmatter } from "../model";

export const get = async () => {
  const postImportResult = await pagesGlobToRssItems(
    import.meta.glob<MarkdownInstance<Frontmatter>>("../pages/*/*.m*")
  );

  const posts = postImportResult
    .sort(
      (a, b) =>
        new Date(b.pubDate ?? "2000-01-01").valueOf() -
        new Date(a.pubDate ?? "2000-01-01").valueOf()
    )
    .slice(0, 10)
    .map((post) => ({
      link: post.link ?? "",
      title: post.title,
      description: post.description,
      pubDate: new Date(post.pubDate ?? "2000-01-01"),
    }));

  return rss({
    title: config.title,
    description: config.description,
    site: config.url,
    items: posts,
    stylesheet: "/styles.xsl",
  });
};
