<!--
	Lays blocks out on fixed A4 sheets. Every block is first rendered in one column
	at sheet width to measure it, then `paginate` assigns blocks to sheets. When done,
	`data-pagination` on the root lists each sheet's fill and overflow for scripts/pdf.ts.
-->
<script lang="ts" module>
	import type { Block } from './paginate.ts';

	const spaceClass = { tight: 'mt-[1.5mm]', item: 'mt-[3.5mm]', section: 'mt-[6mm]' };

	/** Wrapper classes for a block; also used by the web page so both space blocks alike. */
	export const blockClass = (block: Block) => [
		'flow-root first:mt-0',
		block.space && spaceClass[block.space]
	];
</script>

<script lang="ts" generics="T extends Block">
	import { tick, type Snippet } from 'svelte';
	import { paginate, type SheetReport } from './paginate.ts';

	interface Props {
		blocks: T[];
		block: Snippet<[T]>;
		footer?: Snippet<[page: number, pages: number]>;
	}

	let { blocks, block, footer }: Props = $props();

	let measure = $state<HTMLElement>();
	let contents = $state<HTMLElement[]>([]);
	let pages = $state<number[][]>();
	let report = $state<SheetReport[]>();

	$effect(() => {
		const current = blocks;
		let cancelled = false;
		pages = undefined;
		report = undefined;

		(async () => {
			await tick();
			if (!measure) return;
			// Force layout so web fonts start loading, then measure with the final fonts.
			void measure.offsetHeight;
			await document.fonts.ready;
			if (cancelled) return;

			const elements = [...measure.children] as HTMLElement[];
			const measured = current.map((options, index) => {
				const element = elements[index]!;
				return {
					...options,
					height: element.getBoundingClientRect().height,
					space: parseFloat(getComputedStyle(element).marginTop)
				};
			});
			pages = paginate(measured, measure.clientHeight);

			await tick();
			if (cancelled) return;
			report = contents.slice(0, pages.length).map((content) => {
				const box = content.getBoundingClientRect();
				const bottom = content.lastElementChild?.getBoundingClientRect().bottom ?? box.top;
				return {
					fill: Math.round(((bottom - box.top) / box.height) * 100) / 100,
					overflow: bottom > box.bottom + 0.5
				};
			});
		})();

		return () => {
			cancelled = true;
		};
	});
</script>

{#snippet sheet(content: Snippet, page?: number, total?: number)}
	<section
		class="flex h-[297mm] w-[210mm] shrink-0 flex-col overflow-hidden paper px-[14mm] pt-[12mm] pb-[7mm] shadow-xl not-last:break-after-page print:shadow-none"
	>
		{@render content()}
		<footer class="mt-[3mm] flex h-[4mm] items-end justify-end text-[7.5pt] text-muted">
			{#if page && total}
				{@render footer?.(page, total)}
			{/if}
		</footer>
	</section>
{/snippet}

<div
	class="flex flex-col items-center gap-8 print:gap-0"
	data-pagination={report ? JSON.stringify(report) : undefined}
>
	{#if pages}
		{#each pages as page, p (p)}
			{#snippet content()}
				<div class="@container flex min-h-0 flex-1 flex-col" bind:this={contents[p]}>
					{#each page as index (index)}
						{@const item = blocks[index]!}
						<div class={blockClass(item)}>
							{@render block(item)}
						</div>
					{/each}
				</div>
			{/snippet}
			{@render sheet(content, p + 1, pages.length)}
		{/each}
	{:else}
		{#snippet content()}
			<div
				class="@container invisible flex min-h-0 flex-1 flex-col"
				bind:this={measure}
				aria-hidden="true"
			>
				{#each blocks as item, index (index)}
					<div class={blockClass(item)}>
						{@render block(item)}
					</div>
				{/each}
			</div>
		{/snippet}
		{@render sheet(content)}
	{/if}
</div>
