<script lang="ts">
	import type { PostSummary } from '$lib/model';
	import { configuration } from '$lib/config';

	export let post: PostSummary;
	const postDate = new Date(post.date);
</script>

<span class="post-meta"
	>{postDate.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	})}</span
>

<h2>
	<a class="post-link" href={post.slug}
		>{post.title}

		{#if post.teaser}<img
				class="teaser"
				src="/images/teasers/{post.teaser}"
				alt="teaser"
				itemprop="image"
			/>
		{:else}<img
				class="teaser"
				src="/images/{configuration.site.teaser}"
				alt="teaser"
				itemprop="image"
			/>{/if}</a
	>
</h2>

<div class="categories">
	Category:
	<a href="/categories/{post.categories}/">{post.categories}</a>
</div>
<div class="tags">
	Tags:
	{#each post.tags as tag, i}
		<a href="/tags/{tag}/">{tag}</a>
		{#if i < post.tags.length - 1},{' '}{/if}
	{/each}
</div>
