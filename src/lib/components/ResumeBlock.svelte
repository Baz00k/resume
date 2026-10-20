<!--
	One block of the resume, shared by the web page and the PDF. Sizes are in print
	units (pt, mm); container queries (`@xl:`) switch from the narrow mobile layout to
	the sheet layout, which is what an A4 sheet and a desktop browser both get.
-->
<script lang="ts">
	import type { ResumeBlock } from '#lib/blocks.ts';
	import type { Messages } from '#lib/i18n.ts';
	// Small JPEG: Chromium embeds it in the PDF as-is, while WebP would be re-encoded losslessly.
	import profile from '#lib/images/profile.jpg';
	import { contact, spokenLanguages } from '#lib/resume.ts';

	let { block, m }: { block: ResumeBlock; m: Messages } = $props();

	/** `https://www.github.com/x` → `github.com/x`, `mailto:a@b` → `a@b`. */
	const display = (url: string) =>
		url.replace(/^(mailto:|https?:\/\/(www\.)?)/, '').replace(/\/$/, '');
</script>

{#snippet entryTitle(title: string, aside?: string, href?: string)}
	<div class="flex flex-wrap items-baseline justify-between gap-x-4">
		<h3 class="text-[10.5pt] font-semibold text-heading">{title}</h3>
		{#if href}
			<a {href} class="text-[8.5pt] text-muted hover:underline">{aside}</a>
		{:else if aside}
			<span class="text-[8.5pt] text-muted tabular-nums">{aside}</span>
		{/if}
	</div>
{/snippet}

{#if block.kind === 'header'}
	<header
		class="flex flex-col items-center gap-[4mm] text-center @xl:flex-row @xl:gap-[7mm] @xl:text-left"
	>
		<img
			src={profile}
			alt="Jakub Buzuk"
			class="size-[26mm] shrink-0 rounded-full border border-gray-200 object-cover"
		/>
		<div class="flex flex-col gap-[1.5mm]">
			<h1 class="font-display text-[28pt]/none text-heading">Jakub Buzuk</h1>
			<p class="text-[11.5pt] font-medium text-accent">{m.headline}</p>
			<ul
				class="flex flex-wrap justify-center gap-x-[4mm] gap-y-[1mm] text-[8.5pt] @xl:justify-start"
			>
				{#each contact as link (link.href)}
					<li class="flex items-center gap-[1.2mm]">
						<link.icon class="text-muted" />
						<a href={link.href} class="text-ink hover:underline">{display(link.href)}</a>
					</li>
				{/each}
			</ul>
		</div>
	</header>
{:else if block.kind === 'heading'}
	<h2
		class="text-[12pt] font-semibold text-heading underline decoration-[2.5px] underline-offset-[5px]"
	>
		{m.sections[block.section]}
	</h2>
{:else if block.kind === 'about'}
	<p>{m.about}</p>
{:else if block.kind === 'skills'}
	<div class="grid items-baseline gap-x-[3mm] gap-y-[1mm] @xl:grid-cols-[48mm_1fr]">
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
		<a href={block.job.url} class="text-muted hover:underline">{display(block.job.url)}</a>
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
	{@const url = block.project.url}
	{@render entryTitle(block.project.name, url && display(url), url)}
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
