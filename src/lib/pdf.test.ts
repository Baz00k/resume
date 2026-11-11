import { describe, expect, test } from 'vitest';
import { baseLocale, locales } from '#lib/i18n.ts';
import { pdf, pdfLink, pdfs } from '#lib/pdf.ts';
import { themes } from '#lib/theme.ts';

describe('pdfs', () => {
	test('has one PDF per locale and theme, each with its own file', () => {
		const all = pdfs();
		expect(all).toHaveLength(locales.length * themes.length);
		for (const locale of locales)
			for (const theme of themes)
				expect(all).toContainEqual(expect.objectContaining({ locale, theme }));
		expect(new Set(all.map((item) => item.file)).size).toBe(all.length);
	});

	test('links to each PDF where the build writes it', () => {
		for (const item of pdfs()) expect(item.href).toBe(`/${item.file}`);
	});
});

describe('pdf', () => {
	test('prints the base locale from the root print page and others from their prefix', () => {
		for (const locale of locales)
			expect(pdf(locale, 'light').printPath).toBe(
				locale === baseLocale ? '/print/' : `/${locale}/print/`
			);
	});

	test('keeps the published file and download names', () => {
		expect(pdf('pl', 'light')).toEqual({
			locale: 'pl',
			theme: 'light',
			printPath: '/print/',
			file: 'cv/jakub-buzuk-pl-light.pdf',
			href: '/cv/jakub-buzuk-pl-light.pdf',
			downloadName: 'Jakub-Buzuk-CV-PL.pdf'
		});
		expect(pdf('en', 'dark').file).toBe('cv/jakub-buzuk-en-dark.pdf');
		expect(pdf('en', 'dark').downloadName).toBe('Jakub-Buzuk-CV-EN.pdf');
	});
});

describe('pdfLink', () => {
	test('offers the built PDF as a download', () => {
		expect(pdfLink('en', 'dark', false)).toEqual({
			href: '/cv/jakub-buzuk-en-dark.pdf',
			download: 'Jakub-Buzuk-CV-EN.pdf'
		});
	});

	test('opens the print page in dev, where no PDF exists', () => {
		expect(pdfLink('en', 'dark', true)).toEqual({ href: '/en/print/' });
		expect(pdfLink(baseLocale, 'light', true)).toEqual({ href: '/print/' });
	});
});
