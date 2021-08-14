import preprocess from 'svelte-preprocess'
import adapter from '@sveltejs/adapter-static';


const config = {
    preprocess: preprocess(),
    kit: {
		target: '#svelte',
        adapter: adapter()
	},   
};

export default config;