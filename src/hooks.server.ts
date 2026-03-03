import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/translations/server';

export const handle: Handle = ({ event, resolve }) => {
	return paraglideMiddleware(event.request, ({ request: localizedRequest, locale }) => {
		event.request = localizedRequest;
		event.locals.paraglide = { lang: locale, textDirection: 'ltr' };
		return resolve(event, {
			transformPageChunk: ({ html }) => {
				return html.replace('%paraglide.lang%', locale).replace('%paraglide.textDirection%', 'ltr');
			}
		});
	});
};
