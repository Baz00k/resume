<script lang="ts">
	import Icon from '@iconify/svelte';
	import * as m from '$lib/translations/messages';

	interface ContactLink {
		icon: string;
		link: string;
		linkText: string;
		text: () => string;
	}

	const contactLinks: ContactLink[] = [
		{
			icon: 'mdi:email',
			text: m.contact_email,
			link: 'mailto:jakub@buzuk.dev',
			linkText: 'jakub@buzuk.dev'
		},
		{
			icon: 'mdi:linkedin',
			text: m.contact_linkedin,
			link: 'https://www.linkedin.com/in/jakub-buzuk',
			linkText: '@Jakub Buzuk'
		},
		{
			icon: 'mdi:github',
			text: m.contact_github,
			link: 'https://github.com/Baz00k',
			linkText: '@Baz00k'
		}
	];
</script>

{#each contactLinks as contactLink}
	<p class="flex items-center gap-2">
		<Icon icon={contactLink.icon} />
		{contactLink.text()}
		<a href={contactLink.link} target="_blank" rel="noopener noreferrer" class="print:no-underline">
			{contactLink.linkText}
		</a>
	</p>
{/each}
