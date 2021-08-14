<script lang="ts" context="module">
	import type { PageSummary } from '$lib/model';
	export async function load({ fetch }) {
		const resultPages = await fetch('/summary_pages.json');

		const pages = (await resultPages.json()) as PageSummary[];
		return {
			props: { pages }
		};
	}
</script>

<script lang="ts">
	import '../app.scss';

	import Footer from '$lib/components/Footer.svelte';
	import Header from '$lib/components/Header.svelte';
	export let pages: PageSummary[] = [];
</script>

<Header {pages} />

<main class="page-content">
	<div class="wrapper">
		<slot />
	</div>
</main>
<Footer />
