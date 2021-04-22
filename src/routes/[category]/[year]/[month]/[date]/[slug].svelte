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
	import { configuration } from '$lib/config';

	export let post: Post = {
		title: '',
		contents: '',
		tags: [],
		date: new Date().toISOString(),
		thumbnail: ''
	};
</script>

<svelte:head
	><title>GeoExamples - {post.title}</title>
	<!-- Twitter Meta Tags -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="GeoExamples - {post.title}" />
	<meta name="twitter:description" content={configuration.site.description} />
	<meta
		name="twitter:image"
		content="https://geoexamples.com{post.thumbnail ?? '/siteImage.png'}"
	/>
	<!-- Facebook Meta Tags -->
	<meta property="og:url" content="https://geoexamples.com" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="GeoExamples - {post.title}" />
	<meta property="og:description" content={configuration.site.description} />
	<meta property="og:image" content="https://geoexamples.com{post.thumbnail ?? '/siteImage.png'}" />
</svelte:head>
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
