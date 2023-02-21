<script>
	import { ajax } from "rxjs/ajax";
	import { pluck, startWith } from "rxjs/operators";
	import { WiredIconButton, WiredCard } from "wired-elements";
	import { afterUpdate } from 'svelte';
	
	const users$ = ajax("https://api.github.com/users?per_page=5")
	               .pipe(pluck("response"), startWith([])
	);

	afterUpdate(() => {
		const card = document.querySelector("wired-card");
		card.requestUpdate();
	});

</script>
<wired-card elevation="3">
<h1>Users list</h1>
<div>
{#each $users$ as user}
	<p><wired-icon-button style="--wired-icon-size:8px">favorite</wired-icon-button> {user.login} </p>
{/each}
</div>
</wired-card>
