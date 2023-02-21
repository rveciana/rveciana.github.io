<script>
	import './wired.js';
	let name = '';
	let input;
	
	function handleClick() {
		name = input.value;
	}
</script>

<wired-input placeholder="Enter your name" bind:this={input}></wired-input>
<wired-button elevation="3" on:click={handleClick}>Submit</wired-button>

<h4>Hello {name}!</h4>