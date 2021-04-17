import { data } from '$lib/data.json';
import type { PostSummary } from '$lib/model';

const getContents = (slug: string): PostSummary[] =>
	Object.values(data)
		.filter((value) => value.layout === 'post' && value.tags.map((d) => d.toLowerCase() === slug))
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.map((post) => {
			const postDate = new Date(post.date);

			const htmlPath = post.meta.relativePath
				.replace(/\\/g, '/')
				.split('/')
				.pop()
				.split('-')
				.slice(3)
				.join('-');
			return {
				title: post.title,
				date: post.date,
				tags: post.tags,
				categories: post.categories,
				teaser: post.teaser,

				slug: `/${post.categories}/${postDate.getFullYear()}/${postDate.toLocaleDateString(
					'en-US',
					{
						month: '2-digit'
					}
				)}/${postDate.toLocaleDateString('en-US', { day: '2-digit' })}/${htmlPath}`
			};
		});

interface Response {
	body: PostSummary[];
	status: number;
}
export function get(req): Response {
	return { body: getContents(req.params.slug.toLowerCase()), status: 200 };
}
