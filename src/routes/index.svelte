<script lang="ts" context="module">
	export async function load({ fetch }) {
		const resultPosts = await fetch('summary.json');
		const posts = (await resultPosts.json()) as PostSummary[];

		return {
			props: { posts }
		};
	}
</script>

<script lang="ts">
	import PostCard from '$lib/components/PostCard.svelte';
	import type { PostSummary } from '$lib/model';

	export let posts: PostSummary[] = [];
</script>

<div class="home">
	<h1 class="page-heading">Posts</h1>

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
