<script lang="ts">
	import { resolve } from '$app/paths';
	import Header from '#lib/components/Header.svelte';
	import { baseLocale, localeParam, locales, type Locale } from '#lib/i18n.ts';
	import profile from '#lib/images/profile.jpg';
	import { contact, siteUrl, skillGroups } from '#lib/resume.ts';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	// Link previews and search engines need absolute URLs, with the trailing slash the pages are served at.
	const pageUrl = (locale: Locale) =>
		new URL(resolve('/[[lang=lang]]/(site)', { lang: localeParam(locale) }), siteUrl).href.replace(
			/\/?$/,
			'/'
		);
	const ogLocale: Record<Locale, string> = { pl: 'pl_PL', en: 'en_US' };
	const image = new URL('/og.png', siteUrl).href;

	const title = $derived(`Jakub Buzuk · ${data.m.headline}`);
	const url = $derived(pageUrl(data.locale));
	// Structured data for search engines. `<` is escaped so the JSON cannot close its script
	// tag, and the closing tag is split so it does not end this component's script block.
	const person = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'ProfilePage',
			url,
			inLanguage: data.locale,
			mainEntity: {
				'@type': 'Person',
				name: 'Jakub Buzuk',
				jobTitle: data.m.headline,
				description: data.m.description,
				url: pageUrl(baseLocale),
				image: new URL(profile, siteUrl).href,
				sameAs: contact
					.map((link) => link.href)
					.filter((href) => href.startsWith('https://') && href !== siteUrl),
				alumniOf: { '@type': 'CollegeOrUniversity', name: data.m.education.dsw.school },
				knowsAbout: skillGroups.flatMap((group) => group.skills.map((skill) => skill.name))
			}
		}).replaceAll('<', '\\u003c')
	);
	const structuredData = $derived(`<script type="application/ld+json">${person}<${'/'}script>`);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={data.m.description} />
	<link rel="canonical" href={url} />
	{#each locales as locale (locale)}
		<link rel="alternate" hreflang={locale} href={pageUrl(locale)} />
	{/each}
	<link rel="alternate" hreflang="x-default" href={pageUrl(baseLocale)} />

	<meta property="og:type" content="profile" />
	<meta property="og:site_name" content="buzuk.dev" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={data.m.description} />
	<meta property="og:url" content={url} />
	<meta property="og:locale" content={ogLocale[data.locale]} />
	{#each locales.filter((locale) => locale !== data.locale) as locale (locale)}
		<meta property="og:locale:alternate" content={ogLocale[locale]} />
	{/each}
	<meta property="og:image" content={image} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content={title} />
	<meta property="profile:first_name" content="Jakub" />
	<meta property="profile:last_name" content="Buzuk" />
	<meta name="twitter:card" content="summary_large_image" />

	{@html structuredData}
</svelte:head>

<Header locale={data.locale} m={data.m} />
<main class="w-full px-2 py-4 sm:py-6">
	{@render children()}
</main>
