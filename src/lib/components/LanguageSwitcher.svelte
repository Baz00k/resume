<!-- Links, not a <select> that navigates on change (WCAG 3.2.2); crawlers follow them too. -->
<script lang="ts">
	import Check from '~icons/material-symbols/check';
	import ExpandMore from '~icons/material-symbols/expand-more';
	import Translate from '~icons/material-symbols/translate';
	import { localePath, locales, type Locale, type Messages } from '#lib/i18n.ts';

	let { locale, m }: { locale: Locale; m: Messages } = $props();

	const id = $props.id();

	const autonym = (tag: Locale) => new Intl.DisplayNames([tag], { type: 'language' }).of(tag);
</script>

{#if locales.length > 1}
	<button
		type="button"
		popovertarget={id}
		class="group flex cursor-pointer items-center gap-2 rounded-full bg-gray-200/80 py-2 pr-3 pl-4 capitalize backdrop-blur-sm transition-colors duration-300 ease-in-out [anchor-name:--language] hover:bg-gray-300/80 dark:bg-gray-100/10 dark:hover:bg-gray-100/20"
	>
		<Translate class="size-5" />
		<span><span class="sr-only">{m.ui.language}: </span>{autonym(locale)}</span>
		<ExpandMore
			class="size-5 group-has-[+:popover-open]:rotate-180 motion-safe:transition-transform"
		/>
	</button>
	<nav
		{id}
		popover
		aria-label={m.ui.language}
		class="min-w-40 rounded-xl border border-line bg-paper p-1 text-ink shadow-lg [position-anchor:--language] supports-[position-area:bottom]:inset-auto supports-[position-area:bottom]:m-0 supports-[position-area:bottom]:mt-2 supports-[position-area:bottom]:[position-area:bottom_span-right]"
	>
		<ul>
			{#each locales as tag (tag)}
				<li>
					<!-- Full reload so the prerendered page sets the matching <html lang>. -->
					<a
						href={localePath(tag)}
						hreflang={tag}
						lang={tag}
						aria-current={tag === locale ? 'page' : undefined}
						data-sveltekit-reload
						class="flex items-center justify-between gap-4 rounded-lg px-3 py-2 capitalize hover:bg-chip"
					>
						{autonym(tag)}
						{#if tag === locale}<Check class="size-4 text-accent" />{/if}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
{/if}
