/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { baseLocale, locales } from '#lib/i18n.ts';
import { pdf, pdfLink, pdfs } from '#lib/pdf.ts';
import { themes } from '#lib/theme.ts';

describe('pdfs', () => {
	test('has one PDF per locale and theme, each with its own file', () => {
		const all = pdfs();
		assert.equal(all.length, locales.length * themes.length);
		for (const locale of locales)
			for (const theme of themes)
				assert.ok(all.some((item) => item.locale === locale && item.theme === theme));
		assert.equal(new Set(all.map((item) => item.file)).size, all.length);
	});

	test('links to each PDF where the build writes it', () => {
		for (const item of pdfs()) assert.equal(item.href, `/${item.file}`);
	});
});

describe('pdf', () => {
	test('prints the base locale from the root print page and others from their prefix', () => {
		for (const locale of locales)
			assert.equal(
				pdf(locale, 'light').printPath,
				locale === baseLocale ? '/print/' : `/${locale}/print/`
			);
	});

	test('keeps the published file and download names', () => {
		assert.deepEqual(pdf('pl', 'light'), {
			locale: 'pl',
			theme: 'light',
			printPath: '/print/',
			file: 'cv/jakub-buzuk-pl-light.pdf',
			href: '/cv/jakub-buzuk-pl-light.pdf',
			downloadName: 'Jakub-Buzuk-CV-PL.pdf'
		});
		assert.equal(pdf('en', 'dark').file, 'cv/jakub-buzuk-en-dark.pdf');
		assert.equal(pdf('en', 'dark').downloadName, 'Jakub-Buzuk-CV-EN.pdf');
	});
});

describe('pdfLink', () => {
	test('offers the built PDF as a download', () => {
		assert.deepEqual(pdfLink('en', 'dark', false), {
			href: '/cv/jakub-buzuk-en-dark.pdf',
			download: 'Jakub-Buzuk-CV-EN.pdf'
		});
	});

	test('opens the print page in dev, where no PDF exists', () => {
		assert.deepEqual(pdfLink('en', 'dark', true), { href: '/en/print/' });
		assert.deepEqual(pdfLink(baseLocale, 'light', true), { href: '/print/' });
	});
});
