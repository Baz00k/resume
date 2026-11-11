/// <reference types="node" />
// Prints the built site's print route to one PDF per locale and theme.
// Runs after `vite build` (see the `build` script) and writes into `build/`.
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { chromium } from 'playwright';
import { preview } from 'vite';
import { pdfs } from '#lib/pdf.ts';
import { parseSheetReport, reportAttribute, sheetIssues } from '#lib/sheet.ts';

const ci = Boolean(process.env.GITHUB_ACTIONS);
const warn = (message: string) => console.warn(ci ? `::warning::${message}` : `⚠ ${message}`);
const fail = (message: string) => {
	console.error(ci ? `::error::${message}` : `✖ ${message}`);
	process.exitCode = 1;
};

const server = await preview({ logLevel: 'warn', preview: { open: false } });
const origin = server.resolvedUrls?.local[0];
if (!origin) throw new Error('vite preview did not report a URL');

const browser = await chromium.launch();
try {
	for (const job of pdfs()) {
		const file = join('build', job.file);
		const page = await browser.newPage();
		await page.emulateMedia({ media: 'print', colorScheme: job.theme });
		const url = new URL(job.printPath, origin).href;
		// A missing print page would otherwise only show up as a selector timeout.
		const response = await page.goto(url);
		if (!response?.ok()) {
			fail(`${file}: ${url} responded ${response?.status() ?? 'with nothing'}`);
			await page.close();
			continue;
		}
		const pagination = await page.waitForSelector(`[${reportAttribute}]`);
		const sheets = parseSheetReport(await pagination.getAttribute(reportAttribute));

		// Fonts come from Google Fonts; without them the PDF would silently use fallbacks.
		const missingFonts = await page.evaluate(() =>
			['Geist', 'Geist Mono'].filter(
				(family) =>
					![...document.fonts].some((font) => font.family === family && font.status === 'loaded')
			)
		);
		if (missingFonts.length) fail(`${file}: fonts did not load: ${missingFonts.join(', ')}`);

		for (const issue of sheetIssues(sheets)) {
			const log = issue.level === 'error' ? fail : warn;
			log(`${file}, page ${issue.page}/${sheets.length}: ${issue.message}`);
		}

		await mkdir(dirname(file), { recursive: true });
		await page.pdf({
			path: file,
			preferCSSPageSize: true,
			printBackground: true,
			tagged: true,
			outline: true
		});
		console.log(`${file} (${sheets.length} pages)`);
		await page.close();
	}
} finally {
	await browser.close();
	await server.close();
}
