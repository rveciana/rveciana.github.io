import { data } from '$lib/data.json';
import type { PageSummary } from '$lib/model';

const contents: PageSummary[] = Object.values(data)
	.filter((value) => value.layout === 'page')
	.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
	.slice(0, 7)
	.map((post) => {
		return {
			title: post.title,
			permalink: post.permalink.replace(/\/+$/, ''),
			excerpt: post.excerpt,
			avoidMainMenu: post.avoid_main_menu
		};
	});

interface Response {
	body: PageSummary[];
	status: number;
}
export function get(): Response {
	return { body: contents, status: 200 };
}
