<script lang="ts">
	import { getLocale, locales, localizeHref } from '$lib/translations/runtime';
	import type { Locale } from '$lib/translations/runtime';

	const handleLanguageChange = (event: Event) => {
		const select = event.target as HTMLSelectElement;
		const newLocale = select.value as Locale;
		window.location.href = localizeHref('/', { locale: newLocale });
	};

	const getLanguageDisplayName = (tag: Locale) => {
		return new Intl.DisplayNames([getLocale()], { type: 'language' }).of(tag.toUpperCase());
	};
</script>

{#if locales.length > 1}
	<select
		class="rounded-full border-none bg-gray-200 py-2 pl-4 pr-10 capitalize outline-none ring-inset transition-colors duration-300 ease-in-out hover:bg-gray-300 focus-visible:ring-2 focus-visible:ring-gray-500 dark:bg-gray-100/10 dark:hover:bg-gray-100/20"
		value={getLocale()}
		on:change={handleLanguageChange}
	>
		{#each locales as tag}
			<option value={tag}>
				{getLanguageDisplayName(tag)}
			</option>
		{/each}
	</select>
{/if}
