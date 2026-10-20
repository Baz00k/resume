<script lang="ts">
	import ResumeBlock from '#lib/components/ResumeBlock.svelte';
	import { blocks } from '#lib/blocks.ts';
	import { blockClass } from '#lib/print/Paginator.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<!-- The same blocks as the PDF, as one continuous sheet; zoom scales the print sizes up for screens. -->
<article
	class="@container mx-auto w-full max-w-[210mm] [zoom:1.2] rounded-lg paper px-[6mm] py-[8mm] shadow-xl sm:px-[14mm] sm:py-[12mm]"
>
	{#each blocks as block, index (index)}
		<div class={blockClass(block)}>
			<ResumeBlock {block} m={data.m} />
		</div>
	{/each}
</article>
