<script lang="ts">
	import ExportToPdfButton from '#lib/components/ExportToPdfButton.svelte';
	import LanguageSwitcher from '#lib/components/LanguageSwitcher.svelte';
	import type { Locale } from '#lib/i18n.ts';

	let { locale }: { locale: Locale } = $props();
</script>

<header class="flex w-full items-center justify-between px-2 pt-4 lg:px-6 print:hidden">
	<LanguageSwitcher {locale} />
	<div class="invisible flex-1"></div>
	<ExportToPdfButton />
</header>
