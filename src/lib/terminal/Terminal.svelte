<!--
	The terminal inside the drop-down `Console.svelte`. Boots with a one-line motd and `whoami` the first time it is
	opened, then takes commands (typed, or clicked from the chips). `goto` and the "show on
	page" buttons close the console and scroll the page to a section, job or project.
	Resume text comes from `m` and `#lib/resume.ts`; the terminal's own strings (help,
	errors, easter eggs) are English in every locale, like the commands themselves.
-->
<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { dev } from '$app/env';
	import { resolve } from '$app/paths';
	import { localeParam, locales, type Locale, type Messages } from '#lib/i18n.ts';
	import { blocks } from '#lib/blocks.ts';
	import { pdfFileName, pdfPath } from '#lib/pdf.ts';
	import {
		contact,
		education,
		experience,
		projects,
		skillGroups,
		spokenLanguages
	} from '#lib/resume.ts';
	import { theme } from '#lib/theme.svelte.ts';
	import { reopenKey } from './console.ts';

	let {
		locale,
		m,
		active,
		onclose,
		onreveal
	}: {
		locale: Locale;
		m: Messages;
		/** Whether the console is open: boots on the first open, focuses the prompt on each. */
		active: boolean;
		onclose: () => void;
		/** Closes the console and scrolls the page to the block with this index. */
		onreveal: (block: number) => void;
	} = $props();

	type Tone = 'error' | 'dim' | 'ok';
	type Output =
		| { type: 'text'; lines: { text: string; tone?: Tone }[] }
		| { type: 'whoami' | 'about' | 'skills' | 'skillsJson' | 'experience' | 'projects' }
		| { type: 'education' | 'languages' | 'contact' | 'help' | 'neofetch' | 'hire' | 'hint' }
		| { type: 'motd' }
		| { type: 'job'; id: (typeof experience)[number]['id'] }
		| { type: 'project'; id: (typeof projects)[number]['id'] }
		| { type: 'ls'; items: string[] }
		| { type: 'notFound'; command: string; suggestion?: string }
		| { type: 'none' };
	type Entry = { id: number; cwd: string; command?: string; output: Output };

	const text = (...lines: string[]): Output => ({
		type: 'text',
		lines: lines.map((line) => ({ text: line }))
	});
	const error = (line: string): Output => ({
		type: 'text',
		lines: [{ text: line, tone: 'error' }]
	});
	const kebab = (id: string) => id.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
	const display = (url: string) =>
		url.replace(/^(mailto:|https?:\/\/(www\.)?)/, '').replace(/\/$/, '');
	const contactName = (href: string) =>
		href.startsWith('mailto:')
			? 'email'
			: href.includes('linkedin')
				? 'linkedin'
				: href.includes('github')
					? 'github'
					: 'site';
	const email = contact.find((link) => link.href.startsWith('mailto:'))!;
	const linkedIn = contact.find((link) => contactName(link.href) === 'linkedin')!;

	const glyphs: Record<string, string[]> = {
		J: ['     ██╗', '     ██║', '     ██║', '██   ██║', '╚█████╔╝', ' ╚════╝ '],
		A: [' █████╗ ', '██╔══██╗', '███████║', '██╔══██║', '██║  ██║', '╚═╝  ╚═╝'],
		K: ['██╗  ██╗', '██║ ██╔╝', '█████╔╝ ', '██╔═██╗ ', '██║  ██╗', '╚═╝  ╚═╝'],
		U: ['██╗   ██╗', '██║   ██║', '██║   ██║', '██║   ██║', '╚██████╔╝', ' ╚═════╝ '],
		B: ['██████╗ ', '██╔══██╗', '██████╔╝', '██╔══██╗', '██████╔╝', '╚═════╝ '],
		Z: ['███████╗', '╚══███╔╝', '  ███╔╝ ', ' ███╔╝  ', '███████╗', '╚══════╝'],
		' ': ['  ', '  ', '  ', '  ', '  ', '  ']
	};
	/** The ANSI Shadow lettering as an SVG path of its █ cells, so it does not depend on the font. */
	const banner = (word: string) => {
		const rows = glyphs.J!.map((_, row) => [...word].map((char) => glyphs[char]![row]).join(''));
		let path = '';
		rows.forEach((row, y) => {
			for (const run of row.matchAll(/█+/g))
				path += `M${run.index} ${y * 2}h${run[0].length}v2h-${run[0].length}z`;
		});
		return { path, width: rows[0]!.length, height: rows.length * 2 };
	};
	// Repeated `whoami`s repeat the gradient id; the definitions are identical, so any match works.
	const uid = $props.id();

	const commands: { name: string; args?: string; about: string }[] = [
		{ name: 'help', about: 'list commands' },
		{ name: 'whoami', about: 'name, role and contact' },
		{ name: 'about', about: 'a few words about me' },
		{ name: 'skills', about: 'languages, technologies, tools' },
		{ name: 'experience', about: 'work history (alias: exp)' },
		{ name: 'projects', about: 'side projects' },
		{ name: 'education', about: 'schools' },
		{ name: 'languages', about: 'spoken languages' },
		{ name: 'contact', about: 'ways to reach me' },
		{ name: 'open', args: '<target>', about: 'open github, linkedin, email, site or a project' },
		{ name: 'ls', args: '[dir]', about: 'list files' },
		{ name: 'cd', args: '<dir>', about: 'change directory' },
		{ name: 'cat', args: '<file>', about: 'print a file' },
		{ name: 'goto', args: '<section>', about: 'close the terminal and scroll the page there' },
		{ name: 'pdf', about: 'download the CV as PDF' },
		{ name: 'theme', args: '[light|dark]', about: 'switch the color theme' },
		{ name: 'lang', args: '[pl|en]', about: 'switch the language' },
		{ name: 'clear', about: 'clear the screen (Ctrl+L)' },
		{ name: 'gui', about: 'close the terminal (alias: exit, `, Esc)' }
	];
	const hidden = ['exp', 'exit', 'neofetch', 'sudo', 'pwd', 'echo', 'date', 'history', 'whois'];
	const commandNames = [...commands.map((command) => command.name), ...hidden];
	const chips = ['help', 'experience', 'projects', 'skills', 'contact', 'pdf', 'exit'];

	const openTargets: Record<string, string> = {
		...Object.fromEntries(contact.map((link) => [contactName(link.href), link.href])),
		...Object.fromEntries(
			projects.flatMap((project) => (project.url ? [[kebab(project.id), project.url]] : []))
		),
		...Object.fromEntries(experience.map((job) => [kebab(job.id), job.url]))
	};

	const headingIndex = (section: keyof Messages['sections']) =>
		blocks.findIndex((block) => block.kind === 'heading' && block.section === section);
	const jobIndex = (id: string) =>
		blocks.findIndex((block) => block.kind === 'job' && block.job.id === id);
	const projectIndex = (id: string) =>
		blocks.findIndex((block) => block.kind === 'project' && block.project.id === id);
	const gotoTargets: Record<string, number> = {
		...Object.fromEntries(
			(['about', 'skills', 'experience', 'projects', 'education', 'languages'] as const).map(
				(section) => [section, headingIndex(section)]
			)
		),
		...Object.fromEntries(experience.map((job) => [kebab(job.id), jobIndex(job.id)])),
		...Object.fromEntries(projects.map((project) => [kebab(project.id), projectIndex(project.id)]))
	};

	const files: Record<string, string[]> = {
		'~': [
			'about.txt',
			'contact.txt',
			'skills.json',
			'education.txt',
			'languages.txt',
			'cv.pdf',
			'experience/',
			'projects/'
		],
		'~/experience': experience.map((job) => `${kebab(job.id)}.md`),
		'~/projects': projects.map((project) => `${kebab(project.id)}.md`)
	};

	let entries = $state<Entry[]>([]);
	let input = $state('');
	let caret = $state(0);
	let cwd = $state('~');
	let typing = $state(false);
	let focused = $state(false);
	let history: string[] = [];
	let historyIndex = 0;
	let nextId = 0;
	let skip = false;
	let reducedMotion = false;
	let booted = false;

	let field = $state<HTMLInputElement>();
	let scroller = $state<HTMLElement>();

	/** Resolves a path typed in `cwd` to one relative to `~`, without a trailing slash. */
	const resolvePath = (path: string) => {
		const relative = path.replace(/^~\/?/, '').replace(/^\.\//, '').replace(/\/$/, '');
		const base = path.startsWith('~') || cwd === '~' ? '' : `${cwd.slice(2)}/`;
		return relative === '..' ? '' : base + relative;
	};

	const cat = (path: string): Output => {
		const file = resolvePath(path);
		if (!file) return error('cat: missing file operand');
		if (file === 'experience' || file === 'projects') return error(`cat: ${path}: Is a directory`);
		const simple: Record<string, Output['type']> = {
			'about.txt': 'about',
			'contact.txt': 'contact',
			'skills.json': 'skillsJson',
			'education.txt': 'education',
			'languages.txt': 'languages'
		};
		if (file in simple) return { type: simple[file] } as Output;
		if (file === 'cv.pdf')
			return {
				type: 'text',
				lines: [
					{ text: '%PDF-1.7 ����  — binary file, not much to see here.', tone: 'dim' },
					{ text: 'Try `pdf` to download it instead.' }
				]
			};
		const job = experience.find((item) => file === `experience/${kebab(item.id)}.md`);
		if (job) return { type: 'job', id: job.id };
		const project = projects.find((item) => file === `projects/${kebab(item.id)}.md`);
		if (project) return { type: 'project', id: project.id };
		return error(`cat: ${path}: No such file or directory`);
	};

	const distance = (a: string, b: string) => {
		const row = Array.from({ length: b.length + 1 }, (_, i) => i);
		for (let i = 1; i <= a.length; i++) {
			let previous = row[0]!;
			row[0] = i;
			for (let j = 1; j <= b.length; j++) {
				const current = row[j]!;
				row[j] = Math.min(row[j]! + 1, row[j - 1]! + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
				previous = current;
			}
		}
		return row[b.length]!;
	};

	const pdfHref = () =>
		dev
			? resolve('/[[lang=lang]]/print', { lang: localeParam(locale) })
			: pdfPath(locale, theme.current);

	/** Prints a short line, then runs `action` once the user has had a moment to read it. */
	const after = (line: string, action: () => void): Output => {
		setTimeout(action, reducedMotion ? 0 : 280);
		return { type: 'text', lines: [{ text: line, tone: 'dim' }] };
	};

	const execute = (name: string, args: string[]): Output | 'clear' => {
		switch (name) {
			case '':
				return { type: 'none' };
			case 'help':
			case 'whoami':
			case 'about':
			case 'skills':
			case 'experience':
			case 'projects':
			case 'education':
			case 'languages':
			case 'contact':
			case 'neofetch':
				return { type: name };
			case 'exp':
				return { type: 'experience' };
			case 'clear':
				return 'clear';
			case 'ls': {
				const dir = args[0] ? `~/${resolvePath(args[0])}`.replace(/\/$/, '') : cwd;
				const items = files[dir];
				return items
					? { type: 'ls', items }
					: error(`ls: cannot access '${args[0]}': No such file or directory`);
			}
			case 'cd': {
				const dir = args[0] ? `~/${resolvePath(args[0])}`.replace(/\/$/, '') : '~';
				if (!files[dir]) return error(`cd: ${args[0]}: Not a directory`);
				cwd = dir;
				return { type: 'none' };
			}
			case 'pwd':
				return text(cwd.replace('~', '/home/jakub'));
			case 'cat':
				return args.length ? cat(args[0]!) : error('cat: missing file operand');
			case 'goto': {
				const target = args[0]?.toLowerCase().replace(/^~\/|\/$/g, '');
				const index = target === undefined ? undefined : gotoTargets[target];
				if (index === undefined)
					return error(`goto: choose one of: ${Object.keys(gotoTargets).join(', ')}`);
				return after(`Scrolling the page to ${target}…`, () => onreveal(index));
			}
			case 'open': {
				const target = args[0]?.toLowerCase();
				const href = target && openTargets[target];
				if (!href) return error(`open: choose one of: ${Object.keys(openTargets).join(', ')}`);
				if (href.startsWith('mailto:')) window.location.href = href;
				else window.open(href, '_blank', 'noopener');
				return { type: 'text', lines: [{ text: `Opening ${display(href)}…`, tone: 'ok' }] };
			}
			case 'pdf': {
				const link = document.createElement('a');
				link.href = pdfHref();
				if (dev) link.target = '_blank';
				else link.download = pdfFileName(locale);
				link.click();
				return {
					type: 'text',
					lines: [
						{
							text: dev
								? 'Opening the print preview (PDFs exist after `pnpm build`)…'
								: `Downloading ${pdfFileName(locale)}…`,
							tone: 'ok'
						}
					]
				};
			}
			case 'theme': {
				const value = args[0] ?? (theme.current === 'dark' ? 'light' : 'dark');
				if (value !== 'light' && value !== 'dark') return error('theme: use light or dark');
				theme.set(value);
				return { type: 'text', lines: [{ text: `Theme set to ${value}.`, tone: 'ok' }] };
			}
			case 'lang': {
				const value = args[0] ?? locales.find((tag) => tag !== locale)!;
				if (!locales.includes(value as Locale)) return error(`lang: use ${locales.join(' or ')}`);
				// Full reload so the prerendered page sets the matching <html lang>; the console reopens.
				sessionStorage.setItem(reopenKey, '1');
				window.location.href = resolve('/[[lang=lang]]/(site)', {
					lang: localeParam(value as Locale)
				});
				return { type: 'text', lines: [{ text: `Switching to ${value}…`, tone: 'ok' }] };
			}
			case 'gui':
			case 'exit':
				return after('logout', onclose);
			case 'sudo':
				if (args.join(' ') === 'hire-me' || args.join(' ') === 'hire me') return { type: 'hire' };
				return error(`jakub is not in the sudoers file. This incident will be reported.`);
			case 'echo':
				return text(args.join(' '));
			case 'date':
				return text(new Date().toString());
			case 'history':
				return text(...history.map((line, index) => `${String(index + 1).padStart(4)}  ${line}`));
			case 'whois':
				return { type: 'whoami' };
			default: {
				const best = commandNames
					.map((command) => ({ command, score: distance(name, command) }))
					.toSorted((a, b) => a.score - b.score)[0];
				return {
					type: 'notFound',
					command: name,
					suggestion: best && best.score <= 2 ? best.command : undefined
				};
			}
		}
	};

	const run = (raw: string) => {
		const line = raw.trim();
		if (line && history.at(-1) !== line) history.push(line);
		historyIndex = history.length;
		const [name = '', ...args] = line.split(/\s+/);
		const at = cwd;
		const output = execute(name.toLowerCase(), args);
		if (output === 'clear') entries = [];
		else entries.push({ id: nextId++, cwd: at, command: raw, output });
	};

	const delay = (ms: number) =>
		skip || reducedMotion ? Promise.resolve() : new Promise((done) => setTimeout(done, ms));

	/** Types `command` into the prompt like a person would, then runs it. */
	const autoType = async (command: string, speed = 55) => {
		typing = true;
		input = '';
		for (const char of command) {
			input += char;
			caret = input.length;
			await delay(speed * (0.6 + Math.random() * 0.8));
		}
		await delay(220);
		run(command);
		input = '';
		caret = 0;
		typing = false;
	};

	let queue = Promise.resolve();
	const clickCommand = (command: string) => {
		queue = queue.then(() => autoType(command, 28));
		if (matchMedia('(pointer: fine)').matches) field?.focus();
	};

	onMount(() => {
		reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
	});

	$effect(() => {
		if (!active) return;
		// On touch screens focusing would pop the keyboard over the output; tap the prompt instead.
		if (matchMedia('(pointer: fine)').matches) void tick().then(() => field?.focus());
		if (booted) return;
		booted = true;
		entries.push({ id: nextId++, cwd, output: { type: 'motd' } });
		queue = (async () => {
			await delay(250);
			await autoType('whoami', 30);
			skip = false;
		})();
	});

	// Scroll to the prompt, unless the new output is taller than the view: then to where it starts.
	$effect(() => {
		void entries.length;
		void tick().then(() => {
			if (!scroller) return;
			const last = scroller.querySelector<HTMLElement>('[data-entry]:last-of-type');
			const bottom = scroller.scrollHeight - scroller.clientHeight;
			scroller.scrollTo({ top: Math.min(bottom, last ? last.offsetTop - 12 : bottom) });
		});
	});

	const commonPrefix = (words: string[]) =>
		words.reduce((prefix, word) => {
			let i = 0;
			while (i < prefix.length && prefix[i] === word[i]) i++;
			return prefix.slice(0, i);
		});

	const argumentsFor = (command: string, word: string): string[] => {
		if (command === 'open') return Object.keys(openTargets);
		if (command === 'theme') return ['light', 'dark'];
		if (command === 'lang') return [...locales];
		if (command === 'goto') return Object.keys(gotoTargets);
		if (command === 'cat' || command === 'ls' || command === 'cd') {
			const slash = word.lastIndexOf('/');
			const dir = slash === -1 ? '' : word.slice(0, slash + 1);
			const items = files[`~/${resolvePath(dir)}`.replace(/\/$/, '')] ?? [];
			const wanted = command === 'cat' ? items : items.filter((item) => item.endsWith('/'));
			return wanted.map((item) => dir + item);
		}
		return [];
	};

	const complete = () => {
		const parts = input.split(' ');
		const word = parts.at(-1)!;
		const candidates =
			parts.length === 1
				? commands.map((command) => command.name)
				: argumentsFor(parts[0]!.toLowerCase(), word);
		const matches = candidates.filter((candidate) => candidate.startsWith(word));
		if (matches.length === 0) return;
		if (matches.length === 1) {
			const match = matches[0]!;
			parts[parts.length - 1] = match.endsWith('/') ? match : `${match} `;
		} else {
			const prefix = commonPrefix(matches);
			if (prefix.length > word.length) parts[parts.length - 1] = prefix;
			else
				entries.push({ id: nextId++, cwd, command: input, output: { type: 'ls', items: matches } });
		}
		input = parts.join(' ');
		caret = input.length;
	};

	const onkeydown = (event: KeyboardEvent) => {
		if (typing) {
			event.preventDefault();
			skip = true;
			return;
		}
		if (event.code === 'Backquote' && input === '') {
			// Guake-style: the key that opens the console closes it again.
			event.preventDefault();
			onclose();
		} else if (event.key === 'Enter') {
			const command = input;
			input = '';
			caret = 0;
			run(command);
		} else if (event.key === 'Tab') {
			event.preventDefault();
			complete();
		} else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
			event.preventDefault();
			historyIndex = Math.max(
				0,
				Math.min(history.length, historyIndex + (event.key === 'ArrowUp' ? -1 : 1))
			);
			input = history[historyIndex] ?? '';
			caret = input.length;
		} else if (event.ctrlKey && event.key === 'l') {
			event.preventDefault();
			entries = [];
		} else if (event.ctrlKey && event.key === 'c') {
			event.preventDefault();
			entries.push({ id: nextId++, cwd, command: `${input}^C`, output: { type: 'none' } });
			input = '';
			caret = 0;
		}
	};

	const syncCaret = () => {
		caret = field?.selectionStart ?? input.length;
	};

	/** While open, typing anywhere goes to the prompt; any key or click skips the boot animation. */
	const onwindowkeydown = (event: KeyboardEvent) => {
		if (!active) return;
		if (typing) skip = true;
		const target = event.target as HTMLElement;
		if (target === field || target.closest('input, textarea, select, [contenteditable]')) return;
		if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) field?.focus();
	};

	const focusPrompt = () => {
		if (typing) skip = true;
		if (!getSelection()?.toString()) field?.focus();
	};
</script>

<svelte:window onkeydown={onwindowkeydown} />

{#snippet prompt(at: string)}
	<span class="shrink-0 whitespace-pre"
		><span class="text-(--t-green)">jakub@buzuk.dev</span><span class="text-(--t-dim)">:</span><span
			class="text-(--t-blue)">{at}</span
		><span class="text-(--t-dim)">$</span>
	</span>
{/snippet}

{#snippet reveal(block: number)}
	<button
		type="button"
		class="cursor-pointer text-xs whitespace-nowrap text-(--t-dim) hover:text-(--t-green)"
		onclick={() => onreveal(block)}>[show on page ↗]</button
	>
{/snippet}

{#snippet heading(text: string, block?: number)}
	<div class="mt-1 flex flex-wrap items-baseline gap-x-3">
		<span class="font-bold text-(--t-head)"><span class="text-(--t-dim)">##</span> {text}</span>
		{#if block !== undefined}{@render reveal(block)}{/if}
	</div>
{/snippet}

{#snippet link(href: string, label = display(href))}
	<a
		{href}
		target={href.startsWith('mailto:') ? undefined : '_blank'}
		rel="noopener"
		class="text-(--t-fg) underline decoration-(--t-dim)/50 underline-offset-2 hover:decoration-(--t-fg)"
		>{label}</a
	>
{/snippet}

{#snippet jobOutput(job: (typeof experience)[number])}
	{@const text = m.experience[job.id]}
	<div class="mb-2">
		<div class="flex flex-wrap justify-between gap-x-6">
			<span class="font-bold text-(--t-head)">{text.name}</span>
			<span class="text-(--t-dim)">{text.period}</span>
		</div>
		<div>
			<span class="text-(--t-blue) italic">{text.role}</span>
			<span class="text-(--t-dim)">·</span>
			{@render link(job.url)}
		</div>
		<div class="max-w-[90ch]">{text.description}</div>
		{#if 'highlights' in text}
			{#each text.highlights as highlight, index (highlight)}
				<div class="flex gap-2">
					<span class="shrink-0 text-(--t-dim)"
						>{index === text.highlights.length - 1 ? '└─' : '├─'}</span
					>
					<span>{highlight}</span>
				</div>
			{/each}
		{/if}
	</div>
{/snippet}

{#snippet projectOutput(project: (typeof projects)[number])}
	<div class="mb-2">
		<div class="flex flex-wrap justify-between gap-x-6">
			<span class="font-bold text-(--t-head)">{project.name}</span>
			{#if project.url}{@render link(project.url)}{/if}
		</div>
		<div class="max-w-[90ch]">{m.projects[project.id].description}</div>
		<div class="flex flex-wrap gap-x-2 gap-y-1 pt-0.5">
			{#each project.technologies as technology (technology)}
				<span class="rounded-sm border border-(--t-border) px-1.5 text-(--t-dim)">{technology}</span
				>
			{/each}
		</div>
	</div>
{/snippet}

{#snippet output(out: Output)}
	{#if out.type === 'text'}
		{#each out.lines as line, index (index)}
			<div
				class={[
					'whitespace-pre-wrap',
					line.tone === 'error' && 'text-(--t-red)',
					line.tone === 'dim' && 'text-(--t-dim)',
					line.tone === 'ok' && 'text-(--t-green)'
				]}
			>
				{line.text}
			</div>
		{/each}
	{:else if out.type === 'whoami'}
		{@const art = banner('JAKUB BUZUK')}
		{@const id = `${uid}-name`}
		<svg
			viewBox="-0.5 -0.5 {art.width + 1} {art.height + 1}"
			class="my-2 h-auto w-full max-w-xl"
			role="img"
			aria-label="Jakub Buzuk"
		>
			<defs>
				<linearGradient {id} x1="0" x2="1" y1="0" y2="1">
					<stop offset="0" stop-color="var(--t-head)" />
					<stop offset="1" stop-color="var(--t-dim)" />
				</linearGradient>
			</defs>
			<path d={art.path} transform="translate(0.35 0.5)" fill="var(--t-dim)" opacity="0.3" />
			<path d={art.path} fill="url(#{id})" />
		</svg>
		<div class="font-bold text-(--t-head)">
			Jakub Buzuk <span class="text-(--t-dim)">—</span>
			<span class="text-(--t-blue)">{m.headline}</span>
		</div>
		<div class="mt-1 flex flex-wrap gap-x-5 gap-y-1">
			{#each contact as item (item.href)}
				<span class="flex items-center gap-1.5">
					<item.icon class="text-(--t-dim)" />
					{@render link(item.href)}
				</span>
			{/each}
		</div>
	{:else if out.type === 'about'}
		<p class="max-w-[90ch]">{m.about}</p>
		{@render reveal(headingIndex('about'))}
	{:else if out.type === 'skills'}
		{@render reveal(headingIndex('skills'))}
		{#each skillGroups as group (group.id)}
			{@render heading(m.skillGroups[group.id])}
			<div class="flex flex-wrap gap-x-4 gap-y-1 pl-3">
				{#each group.skills as skill (skill.name)}
					<span class="flex items-center gap-1.5"><skill.icon />{skill.name}</span>
				{/each}
			</div>
		{/each}
	{:else if out.type === 'skillsJson'}
		<div class="text-(--t-dim)">{'{'}</div>
		{#each skillGroups as group, index (group.id)}
			<div class="pl-[4ch] -indent-[2ch]">
				<span class="text-(--t-blue)">"{group.id}"</span><span class="text-(--t-dim)">: [</span
				>{#each group.skills as skill, i (skill.name)}<span class="text-(--t-green)"
						>"{skill.name}"</span
					>{#if i < group.skills.length - 1}<span class="text-(--t-dim)">{', '}</span
						>{/if}{/each}<span class="text-(--t-dim)"
					>]{index < skillGroups.length - 1 ? ',' : ''}</span
				>
			</div>
		{/each}
		<div class="text-(--t-dim)">{'}'}</div>
	{:else if out.type === 'experience'}
		{@render heading(m.sections.experience, headingIndex('experience'))}
		{#each experience as job (job.id)}{@render jobOutput(job)}{/each}
	{:else if out.type === 'job'}
		{@render jobOutput(experience.find((job) => job.id === out.id)!)}
	{:else if out.type === 'projects'}
		{@render heading(m.sections.projects, headingIndex('projects'))}
		{#each projects as project (project.id)}{@render projectOutput(project)}{/each}
		<div class="mb-2">
			<span class="font-bold text-(--t-head)">{m.sections.openSource}</span>
			<div class="max-w-[90ch]">{m.openSource}</div>
		</div>
	{:else if out.type === 'project'}
		{@render projectOutput(projects.find((project) => project.id === out.id)!)}
	{:else if out.type === 'education'}
		{@render heading(m.sections.education, headingIndex('education'))}
		{#each education as id (id)}
			{@const text = m.education[id]}
			<div class="mb-1">
				<div class="flex flex-wrap justify-between gap-x-6">
					<span class="font-bold text-(--t-head)">{text.school}</span>
					<span class="text-(--t-dim)">{text.period}</span>
				</div>
				<div class="text-(--t-dim)">{text.field}</div>
			</div>
		{/each}
	{:else if out.type === 'languages'}
		{@render heading(m.sections.languages, headingIndex('languages'))}
		{#each spokenLanguages as language (language.id)}
			<div class="flex items-center gap-2"><language.icon />{m.spokenLanguages[language.id]}</div>
		{/each}
	{:else if out.type === 'contact'}
		{@render heading(m.sections.contact)}
		<div class="grid w-fit grid-cols-[auto_1fr] gap-x-4">
			{#each contact as item (item.href)}
				<span class="flex items-center gap-1.5 text-(--t-dim)"
					><item.icon />{contactName(item.href)}</span
				>
				{@render link(item.href)}
			{/each}
		</div>
		<div class="mt-1 text-(--t-dim)">
			Tip: <span class="text-(--t-fg)">open github</span> opens a link.
		</div>
	{:else if out.type === 'help'}
		<div class="grid w-fit grid-cols-[auto_1fr] gap-x-6">
			{#each commands as command (command.name)}
				<button
					type="button"
					class="cursor-pointer text-left whitespace-nowrap text-(--t-green) hover:underline"
					onclick={() => clickCommand(command.args ? `${command.name} ` : command.name)}
					>{command.name}{#if command.args}<span class="text-(--t-dim)">
							{command.args}</span
						>{/if}</button
				>
				<span class="text-(--t-dim)">{command.about}</span>
			{/each}
		</div>
		<div class="mt-1 text-(--t-dim)">
			Tab completes, ↑/↓ walks the history. There may be a few hidden commands.
		</div>
	{:else if out.type === 'ls'}
		<div class="flex flex-wrap gap-x-6">
			{#each out.items as item (item)}
				<span
					class={item.endsWith('/')
						? 'font-bold text-(--t-blue)'
						: item.endsWith('.pdf')
							? 'text-(--t-red)'
							: item.endsWith('.json')
								? 'text-(--t-green)'
								: ''}>{item}</span
				>
			{/each}
		</div>
	{:else if out.type === 'neofetch'}
		{@const art = banner('JB')}
		{@const id = `${uid}-logo`}
		{@const groups = Object.fromEntries(
			skillGroups.map((group) => [group.id, group.skills.map((s) => s.name)])
		)}
		<div class="flex flex-wrap items-start gap-x-8 gap-y-2 py-1">
			<svg
				viewBox="-0.5 -0.5 {art.width + 1} {art.height + 1}"
				class="h-auto w-28 shrink-0 sm:w-36"
				role="img"
				aria-label="JB"
			>
				<defs>
					<linearGradient {id} x1="0" x2="1" y1="0" y2="1">
						<stop offset="0" stop-color="var(--t-head)" />
						<stop offset="1" stop-color="var(--t-dim)" />
					</linearGradient>
				</defs>
				<path d={art.path} transform="translate(0.35 0.5)" fill="var(--t-dim)" opacity="0.3" />
				<path d={art.path} fill="url(#{id})" />
			</svg>
			<div class="min-w-64 flex-1">
				<div>
					<span class="font-bold text-(--t-green)">jakub</span>@<span
						class="font-bold text-(--t-green)">buzuk.dev</span
					>
				</div>
				<div class="text-(--t-dim)">───────────────</div>
				{#each [['Role', m.headline], ['Uptime', `${new Date().getFullYear() - 2020} years commercial (since 2020)`], ['Languages', groups.programmingLanguages?.join(', ')], ['Stack', groups.technologies
							?.slice(0, 6)
							.join(', ')], ['OS', groups.operatingSystems?.join(', ')], ['Editors', groups.tools
							?.slice(0, 4)
							.join(', ')], ['Shell', 'Bash/Zsh'], ['Locale', locale === 'pl' ? 'pl_PL.UTF-8' : 'en_US.UTF-8'], ['Theme', theme.current === 'dark' ? 'Geist Dark' : 'Geist Light']] as [key, value] (key)}
					<div><span class="font-bold text-(--t-blue)">{key}</span>: {value}</div>
				{/each}
				<div class="mt-2 flex">
					{#each ['red', 'orange', 'yellow', 'green', 'teal', 'blue', 'magenta', 'head'] as color (color)}
						<span class="h-4 w-6" style:background="var(--t-{color})"></span>
					{/each}
				</div>
			</div>
		</div>
	{:else if out.type === 'hire'}
		<div class="text-(--t-dim)">[sudo] password for recruiter: ********</div>
		<div class="text-(--t-green)">✔ Permission granted. Good call.</div>
		<div>
			Jakub is open to new opportunities. Let's talk: {@render link(email.href)} or {@render link(
				linkedIn.href,
				'LinkedIn'
			)}.
		</div>
	{:else if out.type === 'hint'}
		<div class="mt-2 text-(--t-dim)">
			Type <span class="text-(--t-green)">help</span> to see what this terminal can do, or click a command
			below.
		</div>
	{:else if out.type === 'motd'}
		<div class="text-(--t-dim)">
			buzuk.dev tty1 — type <span class="text-(--t-green)">help</span> or pick a command below.
			<span class="hidden sm:inline">` or Esc closes the terminal.</span>
		</div>
	{:else if out.type === 'notFound'}
		<div>
			<span class="text-(--t-red)">command not found: {out.command}</span>
			{#if out.suggestion}
				<span class="text-(--t-dim)">— did you mean</span>
				<span class="whitespace-nowrap"
					><button
						type="button"
						class="cursor-pointer text-(--t-green) underline underline-offset-2"
						onclick={() => clickCommand(out.suggestion!)}>{out.suggestion}</button
					><span class="text-(--t-dim)">?</span></span
				>
			{:else}
				<span class="text-(--t-dim)">— try</span> <span class="text-(--t-green)">help</span>
			{/if}
		</div>
	{/if}
{/snippet}

<section
	class="term flex h-full w-full flex-col overflow-hidden bg-(--t-bg) font-(family-name:--t-font) text-[13px] leading-relaxed text-(--t-fg) sm:text-sm"
	aria-label="Terminal"
>
	<header
		class="relative flex h-9 shrink-0 items-center justify-between border-b border-(--t-border) bg-(--t-bar) px-3 sm:px-6"
	>
		<span class="text-xs text-(--t-dim)">jakub@buzuk.dev: {cwd}</span>
		<button
			type="button"
			class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-0.5 text-xs text-(--t-dim) hover:bg-(--t-border)/60 hover:text-(--t-fg)"
			onclick={onclose}
			aria-label="Close the terminal"
		>
			<kbd class="hidden rounded border border-(--t-border) px-1 font-[inherit] sm:inline">esc</kbd>
			<span aria-hidden="true">✕</span>
		</button>
	</header>

	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
	<div
		bind:this={scroller}
		class="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 selection:bg-(--t-sel) sm:px-6"
		onclick={focusPrompt}
	>
		{#each entries as entry (entry.id)}
			<div data-entry>
				{#if entry.command !== undefined}
					<div class="flex gap-2">
						{@render prompt(entry.cwd)}
						<span class="break-all whitespace-pre-wrap">{entry.command}</span>
					</div>
				{/if}
				<div class="mb-2 empty:mb-0">{@render output(entry.output)}</div>
			</div>
		{/each}

		<label class="relative flex gap-2">
			{@render prompt(cwd)}
			<span class="min-w-0 flex-1 break-all whitespace-pre-wrap"
				>{input.slice(0, caret)}<span
					class={[
						'cursor',
						focused || typing
							? 'bg-(--t-fg) text-(--t-bg)'
							: 'outline outline-1 -outline-offset-1 outline-(--t-dim)',
						!typing && focused && 'blink'
					]}>{input[caret] ?? ' '}</span
				>{input.slice(caret + 1)}</span
			>
			<input
				bind:this={field}
				bind:value={input}
				class="absolute inset-0 w-full cursor-text border-0 bg-transparent p-0 text-base opacity-0 focus:ring-0"
				aria-label="Command"
				autocomplete="off"
				autocapitalize="off"
				spellcheck="false"
				enterkeyhint="send"
				readonly={typing}
				{onkeydown}
				oninput={syncCaret}
				onkeyup={syncCaret}
				onclick={syncCaret}
				onselect={syncCaret}
				onfocus={() => (focused = true)}
				onblur={() => (focused = false)}
			/>
		</label>
	</div>

	<nav
		class="flex shrink-0 [scrollbar-width:none] gap-2 overflow-x-auto border-t border-(--t-border) bg-(--t-bar) px-3 py-2"
		aria-label="Commands"
	>
		{#each chips as chip (chip)}
			<button
				type="button"
				class="shrink-0 cursor-pointer rounded-md border border-(--t-border) px-2.5 py-1 text-xs text-(--t-fg) transition-colors hover:border-(--t-green) hover:text-(--t-green)"
				onclick={() => clickCommand(chip)}
			>
				<span class="text-(--t-dim)">$</span>
				{chip}
			</button>
		{/each}
	</nav>
</section>

<style>
	/* Geist neutrals from the page (see app.css), with restrained ANSI accents. */
	.term {
		--t-font: 'JetBrains Mono', var(--font-mono, ui-monospace), ui-monospace, monospace;
		--t-bg: var(--paper);
		--t-bar: var(--page);
		--t-border: var(--line);
		--t-fg: var(--ink);
		--t-head: var(--heading);
		--t-dim: var(--muted);
		--t-sel: rgb(0 104 214 / 0.18);
		--t-red: #d93036;
		--t-orange: #c25100;
		--t-yellow: #a35200;
		--t-green: #297a3a;
		--t-teal: #067a6e;
		--t-blue: #0068d6;
		--t-magenta: #8e4ec6;
	}

	:global([data-theme='dark']) .term {
		--t-sel: rgb(82 168 255 / 0.25);
		--t-red: #ff6166;
		--t-orange: #ff990a;
		--t-yellow: #f2a60d;
		--t-green: #62c073;
		--t-teal: #0ac7b4;
		--t-blue: #52a8ff;
		--t-magenta: #bf7af0;
	}

	.blink {
		animation: blink 1.06s steps(1) infinite;
	}

	@keyframes blink {
		50% {
			background: transparent;
			color: inherit;
		}
	}
</style>
