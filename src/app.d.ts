import type { ParaglideLocals } from '@inlang/paraglide-sveltekit';
import type { AvailableLanguageTag } from '../../lib/paraglide/runtime';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			paraglide: ParaglideLocals<AvailableLanguageTag>;
		}
		// interface PageData {}
		// interface Platform {}
	}
}

declare module '*.mdx' {
	import type { SvelteComponent } from 'svelte';

	export default class Comp extends SvelteComponent {}

	export const metadata: Record<string, unknown>;
}

export {};
