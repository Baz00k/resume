export interface BreakOptions {
	/** Keep this block on the same page as the next one, e.g. a section heading. */
	keepWithNext?: boolean;
	/** Always start a new page with this block. */
	breakBefore?: boolean;
}

export interface Block extends BreakOptions {
	/** Gap above the block, dropped at the top of a sheet. `lead` follows a section heading. */
	space?: 'tight' | 'lead' | 'item' | 'section';
}

/** Per-sheet result that Paginator publishes in `data-pagination` for scripts/pdf.ts. */
export interface SheetReport {
	/** Share of the sheet's content height in use, 0–1. */
	fill: number;
	/** Content runs past the bottom of the sheet and is cut off. */
	overflow: boolean;
}

export interface MeasuredBlock extends BreakOptions {
	/** Rendered height without margins. */
	height: number;
	/** Space above the block; dropped when the block starts a page. */
	space: number;
}

/**
 * Packs blocks into pages of `pageHeight`, in order. A block moves to the next page
 * together with the blocks it keeps with; if that group cannot fit even on an empty
 * page it is placed block by block, so only a single oversized block can overflow.
 * Returns the indices of the blocks on each page.
 */
export function paginate(blocks: MeasuredBlock[], pageHeight: number): number[][] {
	const pages: number[][] = [[]];
	let used = 0;

	const heightOf = (group: number[], startsPage: boolean) =>
		group.reduce((sum, index, position) => {
			const block = blocks[index]!;
			return sum + block.height + (position === 0 && startsPage ? 0 : block.space);
		}, 0);

	let start = 0;
	while (start < blocks.length) {
		let end = start;
		while (end < blocks.length - 1 && blocks[end]!.keepWithNext) end++;
		let group = Array.from({ length: end - start + 1 }, (_, offset) => start + offset);
		if (group.length > 1 && heightOf(group, true) > pageHeight) group = [start];

		let page = pages.at(-1)!;
		if (
			page.length > 0 &&
			(blocks[start]!.breakBefore || used + heightOf(group, false) > pageHeight)
		) {
			page = [];
			pages.push(page);
			used = 0;
		}

		used += heightOf(group, page.length === 0);
		page.push(...group);
		start += group.length;
	}

	return pages;
}
