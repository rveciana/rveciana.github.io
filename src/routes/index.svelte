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

<svelte:head>
	<title>GeoExamples - Roger Veciana</title>
	<!-- Twitter Meta Tags -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="GeoExamples - Roger Veciana" />
	<meta
		name="twitter:description"
		content="I am a software developer and meteorologist who likes mapping. I put here the things I learn on my free time."
	/>
	<meta name="twitter:image" content="https://geoexamples.com/siteImage.png" />
	<!-- Facebook Meta Tags -->
	<meta property="og:url" content="https://geoexamples.com" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="GeoExamples - Roger Veciana" />
	<meta
		property="og:description"
		content="I am a software developer and meteorologist who likes mapping. I put here the things I learn on my free time."
	/>
	<meta property="og:image" content="https://geoexamples.com/siteImage.png" />
</svelte:head>

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

<h2><a href="blog">Older posts</a></h2>
<p class="rss-subscribe">subscribe <a href="http://feeds.feedburner.com/Geoexamples">via RSS</a></p>
