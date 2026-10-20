<script lang="ts">
	import Download from '~icons/material-symbols/download';
	import { dev } from '$app/env';
	import { resolve } from '$app/paths';
	import { localeParam, type Locale, type Messages } from '#lib/i18n.ts';
	import { pdfFileName, pdfPath } from '#lib/pdf.ts';
	import { theme } from '#lib/theme.svelte.ts';

	let { locale, m }: { locale: Locale; m: Messages } = $props();

	// PDFs only exist after `pnpm build`; in dev, open the print preview they are made from.
	let href = $derived(
		dev
			? resolve('/[[lang=lang]]/print', { lang: localeParam(locale) })
			: pdfPath(locale, theme.current)
	);
</script>

<!-- rel="external": the PDF is not a SvelteKit route, so neither the router nor the prerender crawler should follow it. -->
<a
	{href}
	rel="external"
	download={dev ? undefined : pdfFileName(locale)}
	title={m.ui.downloadPdf}
	class="flex items-center justify-center gap-2 rounded-full bg-gray-200 px-4 py-2 transition-colors duration-300 ease-in-out hover:bg-gray-300 dark:bg-gray-100/10 dark:hover:bg-gray-100/20"
>
	<Download class="size-5" />
	PDF
</a>
