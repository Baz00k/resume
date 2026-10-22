<script lang="ts">
	import type { Component } from 'svelte';
	import ResumeBlock from '#lib/components/ResumeBlock.svelte';
	import { blocks } from '#lib/blocks.ts';
	import { blockClass } from '#lib/print/Paginator.svelte';
	import Console from '#lib/terminal/Console.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// The field is decoration: fetch its code once the page is idle, never before first paint.
	let Field = $state<Component>();
	const load = async () => {
		Field = (await import('#lib/components/AsciiField.svelte')).default;
	};
	$effect(() => {
		// Safari has no requestIdleCallback; a timeout after load is close enough there.
		if ('requestIdleCallback' in window) {
			const idle = requestIdleCallback(load, { timeout: 1500 });
			return () => cancelIdleCallback(idle);
		}
		const timer = setTimeout(load, 200);
		return () => clearTimeout(timer);
	});
</script>

{#if Field}
	<div class="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
		<Field />
	</div>
{/if}

<!-- The same blocks as the PDF, as one continuous sheet; zoom scales the print sizes up for screens. -->
<article
	class="@container mx-auto w-full max-w-[210mm] [zoom:1.2] rounded-xl border border-line paper px-[6mm] py-[8mm] shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_32px_-8px_rgb(0_0_0/0.12)] sm:px-[14mm] sm:py-[12mm] dark:shadow-none"
>
	{#each blocks as block, index (index)}
		<div class={blockClass(block)} data-block={index}>
			<ResumeBlock {block} m={data.m} />
		</div>
	{/each}
</article>

<Console locale={data.locale} m={data.m} />
