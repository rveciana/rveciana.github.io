<script lang="ts" context="module">
	export async function load({ page, fetch }) {
		const resultPosts = await fetch(`${page.params.slug}.json`);
		const posts = (await resultPosts.json()) as PostSummary[];

		return {
			props: { posts, slug: page.params.slug }
		};
	}
</script>

<script lang="ts">
	import PostCard from '$lib/components/PostCard.svelte';
	import type { PostSummary } from '$lib/model';

	export let posts: PostSummary[] = [];
	export let slug: string = ';';
</script>

<div class="home">
	<h1 class="page-heading">Posts by tag: {slug}</h1>
	{posts[0].title}
	<ul class="post-list">
		{#each posts as post}
			<li>
				<PostCard {post} />
			</li>
		{/each}
	</ul>
</div>

<style lang="scss">
</style>
