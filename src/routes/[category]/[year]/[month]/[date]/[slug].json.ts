import { data } from '$lib/data.json';
import { md2html } from '$lib/md2html';
import type { Post } from '$lib/model';

const getContents = (slug: string): Post => {
	const post = Object.values(data).find((d) => d.meta.relativePath.toLowerCase().includes(slug));

	console.log(slug);

	const htmlText = md2html(post ? post.contents : '');
	return post
		? {
				title: post.title,
				contents: htmlText,
				tags: post.tags ?? [],
				date: post.date
		  }
		: {
				title: 'NOT FOUND',
				contents: `No post with this title: ${slug} `,
				tags: [],
				date: new Date().toUTCString()
		  };
};

interface Response {
	body: Post;
	status: number;
}
export function get(req): Response {
	return { body: getContents(req.params.slug.toLowerCase()), status: 200 };
}
