/// <reference types="node" />
// Prints the built site's print route to one PDF per locale and theme.
// Runs after `vite build` (see the `build` script) and writes into `build/`.
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { chromium } from 'playwright';
import { preview } from 'vite';
import { baseLocale, locales } from '#lib/i18n.ts';
import { pdfPath } from '#lib/pdf.ts';
import type { SheetReport } from '#lib/print/paginate.ts';
import { themes } from '#lib/theme.ts';

// A sheet this empty usually means a large block was pushed to the next page.
const minFill = 0.7;
// The last sheet only needs to be worth printing.
const minLastFill = 0.2;

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
	for (const locale of locales) {
		const route = locale === baseLocale ? 'print/' : `${locale}/print/`;
		for (const theme of themes) {
			const page = await browser.newPage();
			await page.emulateMedia({ media: 'print', colorScheme: theme });
			await page.goto(new URL(route, origin).href);
			const pagination = await page.waitForSelector('[data-pagination]');
			const sheets = JSON.parse(
				(await pagination.getAttribute('data-pagination'))!
			) as SheetReport[];

			const file = join('build', pdfPath(locale, theme));
			// Fonts come from Google Fonts; without them the PDF would silently use fallbacks.
			const missingFonts = await page.evaluate(() =>
				['Poppins', 'Raleway'].filter(
					(family) =>
						![...document.fonts].some((font) => font.family === family && font.status === 'loaded')
				)
			);
			if (missingFonts.length) fail(`${file}: fonts did not load: ${missingFonts.join(', ')}`);

			sheets.forEach(({ fill, overflow }, index) => {
				const where = `${file}, page ${index + 1}/${sheets.length}`;
				const last = index === sheets.length - 1;
				if (overflow) fail(`${where}: content is cut off at the bottom`);
				else if (fill < (last ? minLastFill : minFill))
					warn(`${where}: only ${Math.round(fill * 100)}% full`);
			});

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
	}
} finally {
	await browser.close();
	await server.close();
}
