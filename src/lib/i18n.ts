import en from '../../messages/en.json' with { type: 'json' };
import pl from '../../messages/pl.json' with { type: 'json' };

export const locales = ['pl', 'en'] as const;
export const baseLocale = 'pl' satisfies Locale;

export type Locale = (typeof locales)[number];
export type Messages = typeof pl;

// Every locale must have the same keys as the base locale.
const dictionaries = { pl, en } satisfies Record<Locale, Messages>;

export const isLocale = (value: unknown): value is Locale => locales.includes(value as Locale);

/** The base locale lives at the root, every other locale under its own prefix. */
export const localeFromParam = (lang: string | undefined): Locale =>
	isLocale(lang) ? lang : baseLocale;

/**
 * Path of a locale's page with the trailing slash pages are served at: `/` for the base locale, `/en/`
 * otherwise. Built as a string because the site deploys at the domain root, so there is no `paths.base` to
 * resolve against.
 */
export const localePath = (locale: Locale): string => (locale === baseLocale ? '/' : `/${locale}/`);

/** `ll_CC` form of each locale, for og:locale and the terminal's POSIX locale. */
export const posixLocale = { pl: 'pl_PL', en: 'en_US' } satisfies Record<Locale, string>;

export const getMessages = (locale: Locale): Messages => dictionaries[locale];

/** Prerender entries for `[[lang=lang]]` routes; the base locale at `/` is found by the crawler. */
export const localeEntries = () =>
	locales.filter((locale) => locale !== baseLocale).map((lang) => ({ lang }));
