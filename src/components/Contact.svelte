<script lang="ts">
	import Icon from '@iconify/svelte'

	interface ContactLink {
		icon: string
		link: string
		linkText: string
		text: string
	}

	const contactLinks: ContactLink[] = [
		{
			icon: 'mdi:email',
			text: 'Email:',
			link: 'mailto:jakub@buzuk.dev',
			linkText: 'jakub@buzuk.dev'
		},
		{
			icon: 'mdi:linkedin',
			text: 'LinkedIn:',
			link: 'https://www.linkedin.com/in/jakub-buzuk',
			linkText: '@Jakub Buzuk'
		},
		{
			icon: 'mdi:github',
			text: 'GitHub:',
			link: 'https://github.com/Baz00k',
			linkText: '@Baz00k'
		}
	]
</script>

{#each contactLinks as contactLink}
	<p class="flex items-center gap-2">
		<Icon icon={contactLink.icon} />
		{contactLink.text}
		<a href={contactLink.link} target="_blank" rel="noopener noreferrer" class="print:no-underline">
			{contactLink.linkText}
		</a>
	</p>
{/each}
