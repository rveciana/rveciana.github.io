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
	thumbnail: string;
}

export interface PageSummary {
	title: string;
	permalink: string;
	avoidMainMenu?: boolean;
}

export interface TagsAndCategories {
	tags: Tag[];
	categories: string[];
}
export interface Tag {
	label: string;
	occurrences: number;
}
