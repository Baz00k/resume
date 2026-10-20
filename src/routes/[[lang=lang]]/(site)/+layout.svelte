<script lang="ts">
	import Header from '#lib/components/Header.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<Header locale={data.locale} m={data.m} />
<main class="w-full px-2 py-4 sm:py-6">
	{@render children()}
</main>
