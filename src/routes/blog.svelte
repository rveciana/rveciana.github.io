<script lang="ts" context="module">
	export async function load({ fetch }) {
		const resultPosts = await fetch('blog.json');
		const posts = (await resultPosts.json()) as PostSummary[];
		const resultTagsAndCategories = await fetch('tags-and-categories.json');
		const tagsAndCategories = (await resultTagsAndCategories.json()) as TagsAndCategories[];

		return {
			props: { posts, tagsAndCategories }
		};
	}
</script>

<script lang="ts">
	import PostCard from '$lib/components/PostCard.svelte';
	import type { PostSummary, TagsAndCategories } from '$lib/model';

	export let posts: PostSummary[] = [];
	export let tagsAndCategories: TagsAndCategories = { tags: [], categories: [] };
</script>

<h1>Categories</h1>

{#each tagsAndCategories.categories as category, i}<a href="/categories/{category}">{category}</a>
	{#if i < tagsAndCategories.categories.length - 1},{' '}{/if}
{/each}
<h1>Tags</h1>
<div class="tagcloud">
	{#each tagsAndCategories.tags as tag}
		<a
			href="/tags/{tag.label}"
			style="font-size: {`${
				70 +
				100 *
					((tag.occurrences - 1) / Math.max(...tagsAndCategories.tags.map((d) => d.occurrences)))
			}%`}">{tag.label}</a
		>{' '}
	{/each}
</div>
<article class="post-content">
	<h1>Posts</h1>
	<ul class="post-list">
		{#each posts as post}
			<li>
				<PostCard {post} />
			</li>
		{/each}
	</ul>
</article>
<p class="rss-subscribe">subscribe <a href="http://feeds.feedburner.com/Geoexamples">via RSS</a></p>
