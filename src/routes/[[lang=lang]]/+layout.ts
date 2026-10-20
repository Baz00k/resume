import { getMessages, localeFromParam } from '#lib/i18n.ts';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = ({ params }) => {
	const locale = localeFromParam(params.lang);
	return { locale, m: getMessages(locale) };
};
