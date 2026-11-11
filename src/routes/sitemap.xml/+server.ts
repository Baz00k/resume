import { baseLocale, localePath, locales, type Locale } from '#lib/i18n.ts';
import { siteUrl } from '#lib/resume.ts';

export const prerender = true;
// The root layout serves pages with `trailingSlash = 'always'`, which would write `sitemap.xml/index.html`.
export const trailingSlash = 'never';

const url = (locale: Locale) => new URL(localePath(locale), siteUrl).href;

const alternate = (hreflang: string, href: string) =>
	`\t\t<xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}" />`;

// Every page lists itself and all its translations, which is what tells crawlers they are alternates.
const alternates = [
	...locales.map((locale) => alternate(locale, url(locale))),
	alternate('x-default', url(baseLocale))
].join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${locales
	.map((locale) => `\t<url>\n\t\t<loc>${url(locale)}</loc>\n${alternates}\n\t</url>`)
	.join('\n')}
</urlset>
`;

export const GET = () => new Response(sitemap, { headers: { 'Content-Type': 'application/xml' } });
