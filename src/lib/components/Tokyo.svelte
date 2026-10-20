<!-- Layout with a color scheme inspired by the Tokyo Night theme for VS Code. Fonts: Raleway and Poppins. -->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div
	class="prose max-w-full bg-tokyo-light p-6 prose-tokyo md:px-8 md:py-10 dark:bg-tokyo-storm dark:prose-invert prose-headings:font-medium prose-headings:decoration-4 prose-headings:underline-offset-4 prose-h1:text-center prose-h1:text-[3rem] prose-h2:underline prose-ul:flex prose-ul:max-w-[40rem] prose-ul:list-none prose-ul:flex-wrap prose-ul:gap-x-3 prose-li:rounded prose-li:bg-gray-400/10 prose-li:px-2 prose-li:py-1 prose-li:text-sm prose-li:transition-all hover:prose-li:bg-gray-400/20 dark:prose-li:bg-gray-100/10 dark:hover:prose-li:bg-gray-100/20"
>
	{@render children()}
</div>
