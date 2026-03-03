<script lang="ts">
	import LanguageSwitcher from '$components/LanguageSwitcher.svelte';
	import ExportToPdfButton from '$components/ExportToPdfButton.svelte';
</script>

<header class="flex w-full items-center justify-between px-2 pt-4 lg:px-6 print:hidden">
	<LanguageSwitcher />
	<div class="invisible flex-1" />
	<ExportToPdfButton />
</header>
