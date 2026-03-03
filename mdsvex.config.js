import { defineMDSveXConfig as defineConfig } from 'mdsvex';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const config = defineConfig({
	extensions: ['.svelte.md', '.md', '.mdx', '.svx'],

	smartypants: {
		dashes: 'oldschool',
		ellipses: true,
		quotes: true
	},

	remarkPlugins: [],
	rehypePlugins: [],
	layout: {
		basic: resolve(__dirname, 'src/layouts/basic/basic.svelte'),
		tokyo: resolve(__dirname, 'src/layouts/tokyo/tokyo.svelte'),
		_: resolve(__dirname, 'src/layouts/basic/basic.svelte')
	}
});

export default config;
