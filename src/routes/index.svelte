<script lang="ts" context="module">
	export async function load({ fetch }) {
		const resultPosts = await fetch('summary.json?num_posts=5');
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

<h2><a href="/blog">Older posts</a></h2>
<p class="rss-subscribe">subscribe <a href="http://feeds.feedburner.com/Geoexamples">via RSS</a></p>
