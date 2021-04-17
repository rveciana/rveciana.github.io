import { data } from '$lib/data.json';
import type { TagsAndCategories } from '$lib/model';

const getContents = (): TagsAndCategories =>
	Object.values(data)
		.filter((d) => d.layout === 'post')
		.reduce(
			(acc, curr) => ({
				categories: [
					...acc.categories,
					...(acc.categories.includes(curr.categories) ? [] : [curr.categories])
				].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())),
				tags: [...acc.tags, ...curr.tags.filter((d) => !acc.tags.includes(d))].sort((a, b) =>
					a.toLowerCase().localeCompare(b.toLowerCase())
				)
			}),
			{
				tags: [],
				categories: []
			} as TagsAndCategories
		);

interface Response {
	body: TagsAndCategories;
	status: number;
}
export function get(): Response {
	return { body: getContents(), status: 200 };
}
