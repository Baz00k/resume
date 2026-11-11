// How resume blocks are spaced, packed onto A4 sheets, and how the result is reported and
// judged. Plain numbers in and out, so the web page, Paginator, scripts/pdf.ts and the
// tests all share it; the DOM measuring stays in Paginator.

/** Gap above a block, dropped at the top of a sheet. `lead` follows a section heading. */
export type Space = 'tight' | 'lead' | 'item' | 'section';

/** Layout hints a resume block carries; the web page uses `space`, the sheets use both. */
export interface Block {
	space?: Space;
	/** Keep this block on the same sheet as the next one, e.g. a section heading. */
	keepWithNext?: boolean;
}

const spaceClass = {
	tight: 'mt-[2.5mm]',
	lead: 'mt-[4mm]',
	item: 'mt-[6mm]',
	section: 'mt-[9mm]'
} satisfies Record<Space, string>;

/** Wrapper classes for a block, shared by the web page and the sheets so both space blocks alike. */
export const blockClass = (block: Block) => [
	'flow-root first:mt-0',
	block.space && spaceClass[block.space]
];

export interface MeasuredBlock {
	/** Rendered height without margins. */
	height: number;
	/** Space above the block; dropped when the block starts a page. */
	space: number;
	keepWithNext?: boolean;
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
		if (page.length > 0 && used + heightOf(group, false) > pageHeight) {
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

/** Per-sheet result that Paginator publishes for scripts/pdf.ts. */
export interface SheetReport {
	/** Share of the sheet's content height in use, 0–1. */
	fill: number;
	/** Content runs past the bottom of the sheet and is cut off. */
	overflow: boolean;
}

/** Geometry of each rendered sheet's content box, in px. */
export function sheetReport(
	sheets: { top: number; bottom: number; contentBottom: number }[]
): SheetReport[] {
	return sheets.map(({ top, bottom, contentBottom }) => ({
		fill: Math.round(((contentBottom - top) / (bottom - top)) * 100) / 100,
		overflow: contentBottom > bottom + 0.5
	}));
}

/** Root attribute that holds the JSON SheetReport[] once the sheets are laid out. */
export const reportAttribute = 'data-pagination';

const isSheet = (sheet: unknown) =>
	typeof sheet === 'object' &&
	sheet !== null &&
	'fill' in sheet &&
	typeof sheet.fill === 'number' &&
	'overflow' in sheet &&
	typeof sheet.overflow === 'boolean';

/** Parses the attribute Paginator publishes; throws on anything that is not a SheetReport[]. */
export function parseSheetReport(value: string | null): SheetReport[] {
	if (value === null) throw new Error(`${reportAttribute} is missing`);
	const report: unknown = JSON.parse(value);
	if (!Array.isArray(report) || !report.every(isSheet))
		throw new Error(`${reportAttribute} is not a sheet report: ${value}`);
	return report as SheetReport[];
}

export interface SheetIssue {
	level: 'error' | 'warning';
	/** 1-based. */
	page: number;
	message: string;
}

// A sheet this empty usually means a large block was pushed to the next page.
const minFill = 0.7;
// The last sheet only needs to be worth printing.
const minLastFill = 0.2;

export function sheetIssues(report: SheetReport[]): SheetIssue[] {
	return report.flatMap(({ fill, overflow }, index): SheetIssue[] => {
		const page = index + 1;
		if (overflow) return [{ level: 'error', page, message: 'content is cut off at the bottom' }];
		if (fill < (page === report.length ? minLastFill : minFill))
			return [{ level: 'warning', page, message: `only ${Math.round(fill * 100)}% full` }];
		return [];
	});
}
