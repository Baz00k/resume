<script lang="ts">
	import Contact from '#lib/components/Contact.svelte';
	import Tokyo from '#lib/components/Tokyo.svelte';
	import profile from '#lib/images/profile.webp';
	import { education, experience, projects, skillGroups, spokenLanguages } from '#lib/resume.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let m = $derived(data.m);

	const hostname = (url: string) => new URL(url).hostname.replace(/^www\./, '');
</script>

<Tokyo>
	<div class="-mx-6 -mt-8 h-32 bg-gray-400/10 dark:bg-gray-100/10"></div>

	<img
		src={profile}
		class="mx-auto -mt-20 aspect-square h-40 rounded-full border border-gray-200"
		alt="Jakub Buzuk"
	/>

	<h1>Jakub Buzuk</h1>

	<hr />

	<h2>{m.sections.about}</h2>
	<p>{m.about}</p>

	<h2>{m.sections.skills}</h2>
	<div class="grid grid-cols-1 gap-x-4 md:grid-cols-2 print:grid-cols-2">
		{#each skillGroups as group (group.id)}
			<div>
				<h3>{m.skillGroups[group.id]}</h3>
				<ul>
					{#each group.skills as skill (skill.name)}
						<li><skill.icon class="mr-2 inline" /> {skill.name}</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>

	<h2>{m.sections.experience}</h2>
	{#each experience as job (job.id)}
		{@const text = m.experience[job.id]}
		<h3>{text.name}</h3>
		<p>
			<strong><a href={job.url}>{hostname(job.url)}</a></strong>
			<em>{text.role}</em> ({text.period})
		</p>
		<p>{text.description}</p>
		{#if 'highlights' in text}
			<ul>
				{#each text.highlights as highlight (highlight)}
					<li>{highlight}</li>
				{/each}
			</ul>
		{/if}
	{/each}

	<hr />

	<h2>{m.sections.projects}</h2>
	{#each projects as project (project.id)}
		<h3>
			{#if project.url}
				<a href={project.url}>{project.name}</a>
			{:else}
				{project.name}
			{/if}
		</h3>
		<p>{m.projects[project.id].description}</p>
		<p>{m.technologiesUsed}</p>
		<ul>
			{#each project.technologies as technology (technology)}
				<li>{technology}</li>
			{/each}
		</ul>
	{/each}

	<h3>{m.sections.openSource}</h3>
	<p>{m.openSource}</p>

	<hr />

	<h2>{m.sections.education}</h2>
	{#each education as id (id)}
		{@const text = m.education[id]}
		<h3>{text.school}</h3>
		<p><strong>{text.field}</strong> ({text.period})</p>
	{/each}

	<h2>{m.sections.languages}</h2>
	<ul>
		{#each spokenLanguages as language (language.id)}
			<li><language.icon class="mr-2 inline" /> {m.spokenLanguages[language.id]}</li>
		{/each}
	</ul>

	<h2>{m.sections.contact}</h2>
	<Contact />
</Tokyo>
