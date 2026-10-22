// The resume as one ordered list of blocks, rendered by `ResumeBlock.svelte`. The web
// page shows them as one continuous column, the print route packs them onto A4 sheets.
// Steer page breaks with `keepWithNext` / `breakBefore` here; the web page ignores them.
import type { Messages } from '#lib/i18n.ts';
import type { Block } from '#lib/print/paginate.ts';
import { education, experience, projects, skillGroups } from '#lib/resume.ts';

export type ResumeBlock = Block &
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
const section = (id: keyof Messages['sections'], items: ResumeBlock[]): ResumeBlock[] => [
	{ kind: 'heading', section: id, space: 'section', keepWithNext: true },
	...items.map((item, index): ResumeBlock =>
		index === 0 ? { ...item, space: 'lead' } : { space: 'item', ...item }
	)
];

export const blocks: ResumeBlock[] = [
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
		...projects.map((project): ResumeBlock => ({ kind: 'project', project })),
		{ kind: 'openSource' }
	]),
	...section(
		'education',
		education.map((id) => ({ kind: 'school', id }))
	),
	...section('languages', [{ kind: 'languages' }])
];
