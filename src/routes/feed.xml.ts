import { data } from '$lib/data.json';
import { configuration } from '$lib/config';

const getContents = () => {
	const lastBuildDate = data.reduce(
		(acc, curr) => (new Date(curr.date) > acc ? new Date(curr.date) : acc),
		new Date(1970)
	);
	const htmlPath = (relativePath: string) =>
		relativePath.replace(/\\/g, '/').split('/').pop().split('-').slice(3).join('-');

	const getLink = (post) =>
		`${configuration.site.url}/${post.categories}/${new Date(post.date).getFullYear()}/${new Date(
			post.date
		).toLocaleDateString('en-US', {
			month: '2-digit'
		})}/${new Date(post.date).toLocaleDateString('en-US', { day: '2-digit' })}/${htmlPath(
			post.meta.relativePath
		)}`;
	const postEntries = data
		.filter((d) => d.layout === 'post')
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.slice(0, 10)
		.reduce(
			(acc, curr) => `${acc}
        <item>
            <title>${curr.title}</title>
            <description>${curr.excerpt}</description>
            <pubDate>${curr.date}</pubDate>
            <link>${getLink(curr)}</link>
            <guid isPermaLink="true">${getLink(curr)}</guid>
            ${curr.tags.map((d) => `<category>${d}</category>`)}
            <category>${curr.categories}</category>
        </item>`,
			''
		);

	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${configuration.site.title ?? 'RSS FEED'}</title>
    <description>${configuration.site.description ?? ''}</description>
    <link>${configuration.site.url ?? ''}/</link>
    <atom:link href="${
			configuration.site.url ?? ''
		}/feed.xml" rel="self" type="application/rss+xml"/>
    <pubDate>${lastBuildDate.toUTCString()}</pubDate>
    <lastBuildDate>${lastBuildDate.toUTCString()}</lastBuildDate>
    <generator>Svelte</generator>
    ${postEntries}
  </channel>
</rss>
`;
};

interface Response {
	body: string;
	status: number;
}

export function get(): Response {
	return { body: getContents(), status: 200 };
}
