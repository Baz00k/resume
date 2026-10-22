<!-- A4 sheets that scripts/pdf.ts turns into the downloadable PDFs. -->
<script lang="ts">
	import ResumeBlock from '#lib/components/ResumeBlock.svelte';
	import { blocks, type ResumeBlock as Block } from '#lib/blocks.ts';
	import Paginator from '#lib/print/Paginator.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Jakub Buzuk — CV</title>
	<meta name="robots" content="noindex" />
</svelte:head>

{#snippet block(item: Block)}
	<ResumeBlock block={item} m={data.m} />
{/snippet}

{#snippet footer(page: number, pages: number)}
	{page} / {pages}
{/snippet}

<div class="min-h-screen bg-gray-300 py-8 dark:bg-neutral-800 print:bg-transparent print:p-0">
	<Paginator {blocks} {block} {footer} />
</div>

<style>
	@page {
		size: A4;
		margin: 0;
	}
</style>
