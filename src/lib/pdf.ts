import type { Locale } from '#lib/i18n.ts';
import type { Theme } from '#lib/theme.ts';

/** Where `scripts/pdf.ts` writes each PDF inside `build/`, and where the site links to it. */
export const pdfPath = (locale: Locale, theme: Theme) => `/cv/jakub-buzuk-${locale}-${theme}.pdf`;

/** File name offered to whoever downloads the PDF. */
export const pdfFileName = (locale: Locale) => `Jakub-Buzuk-CV-${locale.toUpperCase()}.pdf`;
