import { localePath, locales, type Locale } from '#lib/i18n.ts';
import { themes, type Theme } from '#lib/theme.ts';

/** One PDF the build writes, and everything the site and the build need to know about it. */
export interface Pdf {
	locale: Locale;
	theme: Theme;
	/** Site path of the print page it is printed from, e.g. `/print/`, `/en/print/`. */
	printPath: string;
	/** Output file relative to the build directory, e.g. `cv/jakub-buzuk-pl-light.pdf`. */
	file: string;
	/** Where the site links to it: `/` + file. */
	href: string;
	/** File name offered to whoever downloads it, e.g. `Jakub-Buzuk-CV-PL.pdf`. */
	downloadName: string;
}

export const pdf = (locale: Locale, theme: Theme): Pdf => {
	const file = `cv/jakub-buzuk-${locale}-${theme}.pdf`;
	return {
		locale,
		theme,
		printPath: `${localePath(locale)}print/`,
		file,
		href: `/${file}`,
		downloadName: `Jakub-Buzuk-CV-${locale.toUpperCase()}.pdf`
	};
};

/** Every PDF the build writes: one per locale and theme. */
export const pdfs = (): Pdf[] =>
	locales.flatMap((locale) => themes.map((theme) => pdf(locale, theme)));

/** The link the UI offers: the built PDF, or in dev (PDFs only exist after `pnpm build`) its print page. */
export const pdfLink = (
	locale: Locale,
	theme: Theme,
	dev: boolean
): { href: string; download?: string } => {
	const { printPath, href, downloadName } = pdf(locale, theme);
	return dev ? { href: printPath } : { href, download: downloadName };
};
