import { baseLocale, locales } from '#lib/i18n.ts';
import type { EntryGenerator } from './$types';

// The base locale at `/` is found by the crawler; list the prefixed ones explicitly.
export const entries: EntryGenerator = () =>
	locales.filter((locale) => locale !== baseLocale).map((lang) => ({ lang }));
