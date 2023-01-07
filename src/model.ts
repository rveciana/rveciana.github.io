export interface Frontmatter {
  title: string;
  date: string;
  description?: string;
  categories?: string | string[];
  tags?: string[];
  thumbnail?: string;
  twitterCard?: string;
  teaser?: string;
}
