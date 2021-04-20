<script lang="ts" context="module">
	export async function load({ page, fetch }) {
		const resultPosts = await fetch(`${page.params.slug}.json`);
		const post = (await resultPosts.json()) as Post[];

		return {
			props: { post }
		};
	}
</script>

<script lang="ts">
	import type { Post } from '$lib/model';

	export let post: Post = { title: '', contents: '', tags: [] };
</script>

<div class="post">
	<header class="post-header">
		<h1 class="post-title">{post.title}</h1>
		<p class="post-meta">
			{new Date(post.date).toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric'
			})}
		</p>
	</header>

	<article class="post-content">
		{@html post.contents}
	</article>
</div>
