import { getContents } from '$lib/get_contents';
import type { PostSummary } from '$lib/model';

interface Response {
	body: PostSummary[];
	status: number;
}
export function get(): Response {
	return { body: getContents(undefined), status: 200 };
}
