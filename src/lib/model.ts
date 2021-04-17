export interface PostSummary {
	title: string;
	date: string;
	tags: string[];
	categories: string;
	teaser?: string;
	slug: string;
}

export interface Page {
	title: string;
	contents: string;
}

export interface Post {
	title: string;
	contents: string;
	tags: string[];
	date: string;
}

export interface PageSummary {
	title: string;
	permalink: string;
	excerpt: string;
	avoidMainMenu?: boolean;
}
