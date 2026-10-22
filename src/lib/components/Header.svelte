<script lang="ts">
	import DownloadPdf from '#lib/components/DownloadPdf.svelte';
	import LanguageSwitcher from '#lib/components/LanguageSwitcher.svelte';
	import ThemeToggle from '#lib/components/ThemeToggle.svelte';
	import type { Locale, Messages } from '#lib/i18n.ts';

	let { locale, m }: { locale: Locale; m: Messages } = $props();
</script>

<header class="flex w-full items-center gap-2 px-2 pt-4 lg:px-6 print:hidden">
	<LanguageSwitcher {locale} {m} />
	<div class="flex-1"></div>
	<ThemeToggle {m} />
	<DownloadPdf {locale} {m} />
</header>
