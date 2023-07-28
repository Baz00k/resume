import { defineMDSveXConfig as defineConfig } from 'mdsvex';

const config = defineConfig({
	extensions: ['.svelte.md', '.md', '.svx'],

	smartypants: {
		dashes: 'oldschool'
	},

	remarkPlugins: [],
	rehypePlugins: [],
	layout: {
		basic: '/src/layouts/basic/basic.svelte',
		blue: '/src/layouts/blue/blue.svelte',
		_: '/src/layouts/basic/basic.svelte'
	}
});

export default config;
