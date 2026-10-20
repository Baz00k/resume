<!--
	A4 print layout that scripts/pdf.ts turns into the downloadable PDFs.
	Page breaks are decided by Paginator; steer them here with `keepWithNext` and
	`breakBefore` on a block (conditioned on `data.locale` if the languages differ).
-->
<script lang="ts">
	import Web from '~icons/mdi/web';
	import Paginator, { type Block } from '#lib/print/Paginator.svelte';
	// Small JPEG: Chromium embeds it as-is, while WebP would be re-encoded losslessly (~1.2 MB).
	import profile from '#lib/images/profile-print.jpg';
	import type { Messages } from '#lib/i18n.ts';
	import {
		contact,
		education,
		experience,
		projects,
		skillGroups,
		spokenLanguages
	} from '#lib/resume.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let m = $derived(data.m);

	type PrintBlock = Block &
		(
			| { kind: 'header' }
			| { kind: 'heading'; section: keyof Messages['sections'] }
			| { kind: 'about' }
			| { kind: 'skills'; group: (typeof skillGroups)[number] }
			| { kind: 'job'; job: (typeof experience)[number] }
			| { kind: 'project'; project: (typeof projects)[number] }
			| { kind: 'openSource' }
			| { kind: 'school'; id: (typeof education)[number] }
			| { kind: 'languages' }
		);

	/** A section heading that stays with the first of the blocks below it. */
	const section = (id: keyof Messages['sections'], items: PrintBlock[]): PrintBlock[] => [
		{ kind: 'heading', section: id, space: 'section', keepWithNext: true },
		...items.map((item, index): PrintBlock => ({ space: index === 0 ? 'tight' : 'item', ...item }))
	];

	const blocks: PrintBlock[] = [
		{ kind: 'header' },
		...section('about', [{ kind: 'about' }]),
		...section(
			'skills',
			skillGroups.map((group) => ({ kind: 'skills', group, space: 'tight' }))
		),
		...section(
			'experience',
			experience.map((job) => ({ kind: 'job', job }))
		),
		...section('projects', [
			...projects.map((project): PrintBlock => ({ kind: 'project', project })),
			{ kind: 'openSource' }
		]),
		...section(
			'education',
			education.map((id) => ({ kind: 'school', id }))
		),
		...section('languages', [{ kind: 'languages' }])
	];

	const links = [
		...contact.map(({ icon, href }) => ({ icon, href })),
		{ icon: Web, href: 'https://buzuk.dev' }
	];

	/** `https://www.github.com/x` → `github.com/x`, `mailto:a@b` → `a@b`. */
	const display = (url: string) =>
		url.replace(/^(mailto:|https?:\/\/(www\.)?)/, '').replace(/\/$/, '');
</script>

<svelte:head>
	<title>Jakub Buzuk — CV</title>
	<meta name="robots" content="noindex" />
</svelte:head>

{#snippet heading(text: string)}
	<h2
		class="text-[12pt] font-semibold text-heading underline decoration-[2.5px] underline-offset-[5px]"
	>
		{text}
	</h2>
{/snippet}

{#snippet entryTitle(title: string, period?: string)}
	<div class="flex items-baseline justify-between gap-4">
		<h3 class="text-[10.5pt] font-semibold text-heading">{title}</h3>
		{#if period}
			<span class="shrink-0 text-[8.5pt] text-muted tabular-nums">{period}</span>
		{/if}
	</div>
{/snippet}

{#snippet renderBlock(block: PrintBlock)}
	{#if block.kind === 'header'}
		<header class="flex items-center gap-[7mm]">
			<img
				src={profile}
				alt="Jakub Buzuk"
				class="size-[26mm] shrink-0 rounded-full border border-gray-200 object-cover"
			/>
			<div class="flex flex-col gap-[1.5mm]">
				<h1 class="font-display text-[28pt]/none text-heading">Jakub Buzuk</h1>
				<p class="text-[11.5pt] font-medium text-accent">{m.headline}</p>
				<ul class="flex flex-wrap gap-x-[4mm] gap-y-[1mm] text-[8.5pt]">
					{#each links as link (link.href)}
						<li class="flex items-center gap-[1.2mm]">
							<link.icon class="text-muted" />
							<a href={link.href} class="text-ink">{display(link.href)}</a>
						</li>
					{/each}
				</ul>
			</div>
		</header>
	{:else if block.kind === 'heading'}
		{@render heading(m.sections[block.section])}
	{:else if block.kind === 'about'}
		<p>{m.about}</p>
	{:else if block.kind === 'skills'}
		<div class="grid grid-cols-[48mm_1fr] items-baseline gap-x-[3mm]">
			<h3 class="font-medium text-heading">{m.skillGroups[block.group.id]}</h3>
			<ul class="flex flex-wrap gap-[1.2mm]">
				{#each block.group.skills as skill (skill.name)}
					<li
						class="flex items-center gap-[1.2mm] rounded-[1.2mm] bg-chip px-[1.6mm] py-[0.5mm] text-[8.5pt]"
					>
						<skill.icon />
						{skill.name}
					</li>
				{/each}
			</ul>
		</div>
	{:else if block.kind === 'job'}
		{@const text = m.experience[block.job.id]}
		{@render entryTitle(text.name, text.period)}
		<p class="text-[9pt]">
			<span class="font-medium text-accent italic">{text.role}</span>
			<span class="text-muted">·</span>
			<a href={block.job.url} class="text-muted">{display(block.job.url)}</a>
		</p>
		<p class="mt-[1mm]">{text.description}</p>
		{#if 'highlights' in text}
			<ul class="mt-[1mm] list-disc pl-[5mm] marker:text-accent">
				{#each text.highlights as highlight (highlight)}
					<li>{highlight}</li>
				{/each}
			</ul>
		{/if}
	{:else if block.kind === 'project'}
		<div class="flex items-baseline justify-between gap-4">
			<h3 class="text-[10.5pt] font-semibold text-heading">{block.project.name}</h3>
			{#if block.project.url}
				<a href={block.project.url} class="shrink-0 text-[8.5pt] text-muted">
					{display(block.project.url)}
				</a>
			{/if}
		</div>
		<p>{m.projects[block.project.id].description}</p>
		<p class="mt-[0.5mm] text-[8.5pt] text-muted">
			<span class="font-medium">{m.technologiesUsed}</span>
			{block.project.technologies.join(' · ')}
		</p>
	{:else if block.kind === 'openSource'}
		{@render entryTitle(m.sections.openSource)}
		<p>{m.openSource}</p>
	{:else if block.kind === 'school'}
		{@const text = m.education[block.id]}
		{@render entryTitle(text.school, text.period)}
		<p>{text.field}</p>
	{:else if block.kind === 'languages'}
		<ul class="flex flex-wrap gap-x-[6mm]">
			{#each spokenLanguages as language (language.id)}
				<li class="flex items-center gap-[1.5mm]">
					<language.icon />
					{m.spokenLanguages[language.id]}
				</li>
			{/each}
		</ul>
	{/if}
{/snippet}

{#snippet footer(page: number, pages: number)}
	{page} / {pages}
{/snippet}

<div class="min-h-screen bg-gray-300 py-8 dark:bg-dark print:bg-transparent print:p-0">
	<Paginator {blocks} block={renderBlock} {footer} />
</div>

<style>
	@page {
		size: A4;
		margin: 0;
	}
</style>
