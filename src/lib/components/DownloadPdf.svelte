<script lang="ts">
	import Download from '~icons/material-symbols/download';
	import { dev } from '$app/env';
	import type { Locale, Messages } from '#lib/i18n.ts';
	import { pdfLink } from '#lib/pdf.ts';
	import { theme } from '#lib/theme.svelte.ts';

	let { locale, m }: { locale: Locale; m: Messages } = $props();

	let link = $derived(pdfLink(locale, theme.current, dev));
</script>

<!-- rel="external": the PDF is not a SvelteKit route, so neither the router nor the prerender crawler should follow it. -->
<a
	href={link.href}
	rel="external"
	download={link.download}
	aria-label={m.ui.downloadPdf}
	title={m.ui.downloadPdf}
	class="flex items-center justify-center gap-2 rounded-full bg-gray-200/80 px-4 py-2 backdrop-blur-sm transition-colors duration-300 ease-in-out hover:bg-gray-300/80 dark:bg-gray-100/10 dark:hover:bg-gray-100/20"
>
	<Download class="size-5" />
	PDF
</a>
