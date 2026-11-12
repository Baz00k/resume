import { describe, expect, test } from 'vitest';
import { paginate, parseSheetReport, sheetIssues, type MeasuredBlock } from '#lib/sheet.ts';

const block = (height: number, space = 0, keepWithNext = false): MeasuredBlock => ({
	height,
	space,
	keepWithNext
});

describe('paginate', () => {
	test('fills a page exactly to its height before starting the next', () => {
		expect(paginate([block(50), block(40, 10), block(1)], 100)).toEqual([[0, 1], [2]]);
	});

	test('moves a keepWithNext group to the next page together', () => {
		// The heading (1) alone would fit on page 1, but its job (2) would not.
		const blocks = [block(60), block(10, 5, true), block(40, 5)];
		expect(paginate(blocks, 100)).toEqual([[0], [1, 2]]);
	});

	test('places a group taller than a page block by block', () => {
		const blocks = [block(10), block(50, 5, true), block(60, 5)];
		expect(paginate(blocks, 100)).toEqual([[0, 1], [2]]);
	});

	test('drops the space of the block that starts a page', () => {
		// Page 2 holds 80 + (10 + 10): it only fits if block 1 lost its 30px space.
		expect(paginate([block(60), block(80, 30), block(10, 10)], 100)).toEqual([[0], [1, 2]]);
	});
});

describe('parseSheetReport', () => {
	test('returns a valid report', () => {
		const report = [
			{ fill: 0.9, overflow: false },
			{ fill: 0.4, overflow: true }
		];
		expect(parseSheetReport(JSON.stringify(report))).toEqual(report);
	});

	test('rejects a missing attribute or a different shape', () => {
		for (const value of [null, '{}', '[{"fill": 0.5}]', '[{"fill": "0.5", "overflow": false}]'])
			expect(() => parseSheetReport(value), String(value)).toThrow();
	});
});

describe('sheetIssues', () => {
	test('lets only the last sheet be sparse', () => {
		const sparse = { fill: 0.5, overflow: false };
		expect(sheetIssues([sparse, sparse])).toEqual([
			{ level: 'warning', page: 1, message: 'only 50% full' }
		]);
	});

	test('reports overflow as an error, not as low fill', () => {
		expect(
			sheetIssues([
				{ fill: 0.1, overflow: true },
				{ fill: 0.9, overflow: false }
			])
		).toEqual([{ level: 'error', page: 1, message: 'content is cut off at the bottom' }]);
	});
});
