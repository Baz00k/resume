import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		paraglideVitePlugin({
			project: './translations/settings.inlang',
			outdir: './src/lib/translations',
			strategy: ['url', 'cookie', 'baseLocale']
		}),
		sveltekit()
	]
});
