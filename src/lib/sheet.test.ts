/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
	blockClass,
	paginate,
	parseSheetReport,
	sheetIssues,
	sheetReport,
	type MeasuredBlock
} from '#lib/sheet.ts';

const block = (height: number, space = 0, keepWithNext = false): MeasuredBlock => ({
	height,
	space,
	keepWithNext
});

describe('blockClass', () => {
	test('adds the margin class for the block space', () => {
		assert.deepEqual(blockClass({ space: 'item' }), ['flow-root first:mt-0', 'mt-[6mm]']);
		assert.deepEqual(blockClass({}), ['flow-root first:mt-0', undefined]);
	});
});

describe('paginate', () => {
	test('keeps everything on one page when it fits', () => {
		assert.deepEqual(paginate([block(30), block(25, 10), block(25, 10)], 100), [[0, 1, 2]]);
	});

	test('moves a keepWithNext group to the next page together', () => {
		// The heading (1) alone would fit on page 1, but its job (2) would not.
		const blocks = [block(60), block(10, 5, true), block(40, 5)];
		assert.deepEqual(paginate(blocks, 100), [[0], [1, 2]]);
	});

	test('places a group taller than a page block by block', () => {
		const blocks = [block(10), block(50, 5, true), block(60, 5)];
		assert.deepEqual(paginate(blocks, 100), [[0, 1], [2]]);
	});

	test('drops the space of the block that starts a page', () => {
		// Page 2 holds 80 + (10 + 10): it only fits if block 1 lost its 30px space.
		assert.deepEqual(paginate([block(60), block(80, 30), block(10, 10)], 100), [[0], [1, 2]]);
	});

	test('fills a page exactly to its height', () => {
		assert.deepEqual(paginate([block(50), block(40, 10), block(1)], 100), [[0, 1], [2]]);
	});
});

describe('sheetReport', () => {
	test('reports fill as a share of the content box, rounded to 2 decimals', () => {
		assert.deepEqual(sheetReport([{ top: 100, bottom: 400, contentBottom: 300 }]), [
			{ fill: 0.67, overflow: false }
		]);
	});

	test('flags overflow only beyond 0.5px past the bottom', () => {
		assert.deepEqual(
			sheetReport([
				{ top: 0, bottom: 100, contentBottom: 100.5 },
				{ top: 0, bottom: 100, contentBottom: 100.6 }
			]).map(({ overflow }) => overflow),
			[false, true]
		);
	});
});

describe('parseSheetReport', () => {
	test('accepts a valid report', () => {
		const report = [
			{ fill: 0.9, overflow: false },
			{ fill: 0.4, overflow: true }
		];
		assert.deepEqual(parseSheetReport(JSON.stringify(report)), report);
		assert.deepEqual(parseSheetReport('[]'), []);
	});

	test('throws on a missing attribute', () => {
		assert.throws(() => parseSheetReport(null));
	});

	test('throws on bad JSON', () => {
		assert.throws(() => parseSheetReport('[{fill: 1'), SyntaxError);
	});

	test('throws on the wrong shape', () => {
		for (const value of [
			'{}',
			'null',
			'[1]',
			'[null]',
			'[{"fill": 0.5}]',
			'[{"fill": "0.5", "overflow": false}]',
			'[{"fill": 0.5, "overflow": "no"}]'
		])
			assert.throws(() => parseSheetReport(value), /not a sheet report/, value);
	});
});

describe('sheetIssues', () => {
	test('passes full sheets and a sparse last sheet', () => {
		assert.deepEqual(
			sheetIssues([
				{ fill: 0.7, overflow: false },
				{ fill: 0.2, overflow: false }
			]),
			[]
		);
	});

	test('warns about a sheet under 70% full', () => {
		assert.deepEqual(
			sheetIssues([
				{ fill: 0.69, overflow: false },
				{ fill: 0.9, overflow: false }
			]),
			[{ level: 'warning', page: 1, message: 'only 69% full' }]
		);
	});

	test('warns about a last sheet under 20% full', () => {
		assert.deepEqual(
			sheetIssues([
				{ fill: 0.9, overflow: false },
				{ fill: 0.19, overflow: false }
			]),
			[{ level: 'warning', page: 2, message: 'only 19% full' }]
		);
	});

	test('reports overflow as an error, not as low fill', () => {
		assert.deepEqual(
			sheetIssues([
				{ fill: 0.1, overflow: true },
				{ fill: 0.9, overflow: false }
			]),
			[{ level: 'error', page: 1, message: 'content is cut off at the bottom' }]
		);
	});
});
