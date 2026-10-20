import { defineParams } from '@sveltejs/kit/params';
import { baseLocale, isLocale } from '#lib/i18n.ts';

export const params = defineParams({
	// The base locale is served without a prefix, so only other locales match.
	lang: (param) => (isLocale(param) && param !== baseLocale ? param : undefined)
});
