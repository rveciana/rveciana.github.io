import { data } from '$lib/data.json';
import { md2html } from '$lib/md2html';
import type { Page } from '$lib/model';

const getContents = (slug: string): Page => {
	const post = Object.values(data).find((d) => d.meta.relativePath.includes(slug));

	const htmlText = md2html(post ? post.contents : '');

	return post
		? { title: post.title, contents: htmlText }
		: {
				title: 'NOT FOUND',
				contents: `No page withthis title: ${slug}`
		  };
};

interface Response {
	body: Page;
	status: number;
}
export function get(req): Response {
	return { body: getContents(req.params.slug.toLowerCase()), status: 200 };
}
