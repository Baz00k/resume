<script lang="ts">
	import DarkMode from '~icons/material-symbols/dark-mode-outline';
	import LightMode from '~icons/material-symbols/light-mode-outline';
	import type { Messages } from '#lib/i18n.ts';
	import { theme } from '#lib/theme.svelte.ts';
	import type { Theme } from '#lib/theme.ts';

	let { m }: { m: Messages } = $props();

	let next: Theme = $derived(theme.current === 'dark' ? 'light' : 'dark');
</script>

<button
	class="flex size-10 cursor-pointer items-center justify-center rounded-full bg-gray-200 transition-colors duration-300 ease-in-out hover:bg-gray-300 dark:bg-gray-100/10 dark:hover:bg-gray-100/20"
	aria-label={next === 'dark' ? m.ui.switchToDark : m.ui.switchToLight}
	title={next === 'dark' ? m.ui.switchToDark : m.ui.switchToLight}
	onclick={() => theme.set(next)}
>
	{#if theme.current === 'dark'}
		<LightMode class="size-5" />
	{:else}
		<DarkMode class="size-5" />
	{/if}
</button>
