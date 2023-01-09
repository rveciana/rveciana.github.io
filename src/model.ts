export interface Frontmatter {
  title: string;
  pubDate: string;
  description?: string;
  categories?: string | string[];
  tags?: string[];
  thumbnail?: string;
  twitterCard?: string;
  teaser?: string;
}
