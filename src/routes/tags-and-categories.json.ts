import { data } from '$lib/data.json';
import type { Tag, TagsAndCategories } from '$lib/model';

const getContents = (): TagsAndCategories =>
	Object.values(data)
		.filter((d) => d.layout === 'post')
		.reduce(
			(acc, curr) => ({
				categories: [
					...acc.categories,
					...(acc.categories.includes(curr.categories) ? [] : [curr.categories])
				].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())),
				tags: [
					...acc.tags.map((d) =>
						curr.tags.includes(d.label) ? { ...d, occurrences: d.occurrences + 1 } : d
					),
					...curr.tags
						.filter((d) => !acc.tags.some((tag) => tag.label === d))
						.map((d) => ({ label: d, occurrences: 1 }))
				]
			}),
			{
				tags: [] as Tag[],
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
