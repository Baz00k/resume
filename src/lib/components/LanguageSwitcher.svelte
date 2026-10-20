<script lang="ts">
	import { resolve } from '$app/paths';
	import { localeParam, locales, type Locale } from '#lib/i18n.ts';

	let { locale }: { locale: Locale } = $props();

	const handleLanguageChange = (event: Event & { currentTarget: HTMLSelectElement }) => {
		const lang = localeParam(event.currentTarget.value as Locale);
		// Full reload so the prerendered page sets the matching <html lang>.
		window.location.href = resolve('/[[lang=lang]]', { lang });
	};

	const getLanguageDisplayName = (tag: Locale) =>
		new Intl.DisplayNames([locale], { type: 'language' }).of(tag.toUpperCase());
</script>

{#if locales.length > 1}
	<select
		class="rounded-full border-none bg-gray-200 py-2 pr-10 pl-4 capitalize outline-hidden transition-colors duration-300 ease-in-out ring-inset hover:bg-gray-300 focus-visible:ring-2 focus-visible:ring-gray-500 dark:bg-gray-100/10 dark:hover:bg-gray-100/20"
		value={locale}
		onchange={handleLanguageChange}
	>
		{#each locales as tag (tag)}
			<option value={tag}>
				{getLanguageDisplayName(tag)}
			</option>
		{/each}
	</select>
{/if}
