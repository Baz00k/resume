import { mdsvex } from 'mdsvex';
import mdsvexConfig from './mdsvex.config.js';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/kit/vite';

const dev = process.env.NODE_ENV === 'development';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', ...mdsvexConfig.extensions],

	preprocess: [vitePreprocess({}), mdsvex(mdsvexConfig)],

	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: null
		}),

		// Use base path for GitHub Pages
		paths: {
			base: dev ? '' : process.env.BASE_PATH
		},

		alias: {
			$components: './src/components',
		}
	}
};

export default config;
