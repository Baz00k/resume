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

export const localeParam = (locale: Locale) => (locale === baseLocale ? undefined : locale);

export const getMessages = (locale: Locale): Messages => dictionaries[locale];
