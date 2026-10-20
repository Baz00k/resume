<script lang="ts">
	import Header from '#lib/components/Header.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<Header locale={data.locale} m={data.m} />
<main class="w-full px-2 py-4 print:p-0">
	<div
		class="mx-auto h-full min-h-[29.7cm] w-full max-w-[21cm] min-w-min overflow-clip rounded-lg bg-gray-50 dark:bg-gray-100/10 print:absolute print:top-0 print:left-0 print:m-0 print:w-full print:rounded-none"
		id="resume"
	>
		{@render children()}
	</div>
</main>
