import { expect, test } from 'vitest';
import { pdf, pdfs } from '#lib/pdf.ts';

test('writes every locale and theme to its own file', () => {
	const files = pdfs().map((item) => item.file);
	expect(new Set(files).size).toBe(files.length);
});

// These URLs and names are public: links and saved downloads depend on them.
test('keeps the published print pages, file and download names', () => {
	expect(pdf('pl', 'light')).toMatchObject({
		printPath: '/print/',
		href: '/cv/jakub-buzuk-pl-light.pdf',
		downloadName: 'Jakub-Buzuk-CV-PL.pdf'
	});
	expect(pdf('en', 'dark')).toMatchObject({
		printPath: '/en/print/',
		href: '/cv/jakub-buzuk-en-dark.pdf',
		downloadName: 'Jakub-Buzuk-CV-EN.pdf'
	});
});
