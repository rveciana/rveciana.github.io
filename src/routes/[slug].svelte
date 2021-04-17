<script lang="ts" context="module">
	export async function load({ page, fetch }) {
		const resultPosts = await fetch(`${page.params.slug}.json`);
		const post = (await resultPosts.json()) as Page[];

		return {
			props: { post }
		};
	}
</script>

<script lang="ts">
	import type { Page } from '$lib/model';

	export let post: Page = { title: '', contents: '' };
</script>

<div class="post">
	<header class="post-header">
		<h1 class="post-title">{post.title}</h1>
	</header>

	<article class="post-content">{@html post.contents}</article>
</div>
