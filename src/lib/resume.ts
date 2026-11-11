// Locale-independent resume data: ordering, links, icons and proper nouns.
// All translatable text lives in `messages/*.json`, keyed by the ids used here.
import type { Component } from 'svelte';
import type { Messages } from '#lib/i18n.ts';

import Apple from '~icons/fa6-brands/apple';
import Linux from '~icons/fa6-brands/linux';
import NodeJs from '~icons/fa6-brands/node-js';
import Windows from '~icons/fa6-brands/windows';
import Angular from '~icons/devicon/angular';
import CSharp from '~icons/devicon/csharp';
import DotNet from '~icons/devicon/dotnetcore';
import Python from '~icons/devicon/python';
import React from '~icons/devicon/react';
import Tailwind from '~icons/devicon/tailwindcss';
import Traefik from '~icons/devicon/traefikproxy';
import Vue from '~icons/devicon/vuejs';
import Email from '~icons/mdi/email';
import GitHubMark from '~icons/mdi/github';
import LinkedIn from '~icons/mdi/linkedin';
import Web from '~icons/mdi/web';
// Single-colour marks follow the text colour, so they stay visible in the dark theme.
import Bun from '~icons/simple-icons/bun';
import Claude from '~icons/simple-icons/claude';
import Cloudflare from '~icons/simple-icons/cloudflare';
import Django from '~icons/simple-icons/django';
import GitHubActions from '~icons/simple-icons/githubactions';
import Mcp from '~icons/simple-icons/modelcontextprotocol';
import NextJs from '~icons/simple-icons/nextdotjs';
import OpenCode from '~icons/simple-icons/opencode';
import OpenAi from '~icons/simple-icons/openai';
import OpenApi from '~icons/simple-icons/openapiinitiative';
import Proxmox from '~icons/simple-icons/proxmox';
import Rust from '~icons/simple-icons/rust';
import Tailscale from '~icons/simple-icons/tailscale';
import Css from '~icons/skill-icons/css';
import Docker from '~icons/skill-icons/docker';
import Git from '~icons/skill-icons/git';
import Html from '~icons/skill-icons/html';
import JavaScript from '~icons/skill-icons/javascript';
import Svelte from '~icons/skill-icons/svelte';
import TypeScript from '~icons/skill-icons/typescript';
import Agents from '~icons/tabler/robot';
import Orchestration from '~icons/tabler/sitemap';
import MicroFrontends from '~icons/tabler/puzzle';
import FlagGermany from '~icons/twemoji/flag-for-flag-germany';
import FlagPoland from '~icons/twemoji/flag-for-flag-poland';
import FlagUnitedStates from '~icons/twemoji/flag-for-flag-united-states';

type Icon = Component<{ class?: string }>;

export interface Skill {
	name: string;
	icon: Icon;
}

export const skillGroups: { id: keyof Messages['skillGroups']; skills: Skill[] }[] = [
	{
		id: 'languages',
		skills: [
			{ name: 'TypeScript', icon: TypeScript },
			{ name: 'JavaScript', icon: JavaScript },
			{ name: 'C#', icon: CSharp },
			{ name: 'Python', icon: Python },
			{ name: 'Rust', icon: Rust },
			{ name: 'HTML', icon: Html },
			{ name: 'CSS', icon: Css }
		]
	},
	{
		id: 'frontend',
		skills: [
			{ name: 'React', icon: React },
			{ name: 'Angular', icon: Angular },
			{ name: 'Svelte', icon: Svelte },
			{ name: 'Vue', icon: Vue },
			{ name: 'Next.js', icon: NextJs },
			{ name: 'Tailwind CSS', icon: Tailwind },
			{ name: 'Micro-frontends', icon: MicroFrontends }
		]
	},
	{
		id: 'backend',
		skills: [
			{ name: 'ASP.NET Core', icon: DotNet },
			{ name: 'Entity Framework', icon: DotNet },
			{ name: 'Node.js', icon: NodeJs },
			{ name: 'Bun', icon: Bun },
			{ name: 'Django', icon: Django },
			{ name: 'REST / OpenAPI', icon: OpenApi }
		]
	},
	{
		id: 'infrastructure',
		skills: [
			{ name: 'Docker', icon: Docker },
			{ name: 'Git', icon: Git },
			{ name: 'GitHub Actions', icon: GitHubActions },
			{ name: 'Proxmox', icon: Proxmox },
			{ name: 'Traefik', icon: Traefik },
			{ name: 'Tailscale', icon: Tailscale },
			{ name: 'Cloudflare', icon: Cloudflare }
		]
	},
	{
		id: 'systems',
		skills: [
			{ name: 'Linux', icon: Linux },
			{ name: 'macOS', icon: Apple },
			{ name: 'Windows', icon: Windows },
			{ name: 'Windows Server / Active Directory', icon: Windows }
		]
	},
	{
		id: 'ai',
		skills: [
			{ name: 'AI agents', icon: Agents },
			{ name: 'T3 Code', icon: Orchestration },
			{ name: 'OpenCode', icon: OpenCode },
			{ name: 'Claude Code', icon: Claude },
			{ name: 'Codex', icon: OpenAi },
			{ name: 'MCP', icon: Mcp }
		]
	}
];

export const experience: { id: keyof Messages['experience']; url?: string }[] = [
	{ id: 'softiq', url: 'https://softiq.pl' },
	{ id: 'freelance', url: 'https://www.julkamigdalska.pl/' }
];

export const projects: {
	id: keyof Messages['projects'];
	name: string;
	url?: string;
	technologies: string[];
}[] = [
	{
		id: 'wolfUiNext',
		name: 'Wolf UI Next',
		url: 'https://github.com/Baz00k/wolf-ui-next',
		technologies: ['Rust', 'Dioxus', 'Tokio', 'OpenAPI', 'Docker', 'GitHub Actions']
	},
	{
		id: 'gowCollection',
		name: 'GoW Collection',
		url: 'https://github.com/Baz00k/gow-collection',
		technologies: ['Docker', 'Bash', 'GitHub Actions', 'GHCR']
	},
	{
		id: 'homelab',
		name: 'Homelab',
		technologies: [
			'Proxmox',
			'TrueNAS',
			'Docker',
			'Komodo',
			'Traefik',
			'Tailscale',
			'Cloudflare Tunnel',
			'CLIProxyAPI',
			'llama.cpp'
		]
	},
	{
		id: 'auchanCli',
		name: 'auchan-cli',
		technologies: ['TypeScript', 'Effect', 'Playwright', 'Vitest']
	},
	{
		id: 'hydroHomie',
		name: 'Hydro Homie',
		technologies: ['ESP32-C6', 'ESPHome', 'atopile', 'KiCad', 'Home Assistant']
	},
	{
		id: 'slopBlast',
		name: 'Slop Blast',
		url: 'https://slop-blast.buzuk.dev',
		technologies: [
			'TypeScript',
			'React',
			'TanStack Start',
			'SQLite',
			'Drizzle',
			'WebAuthn',
			'Playwright',
			'Docker'
		]
	},
	{
		id: 'resume',
		name: 'buzuk.dev',
		url: 'https://github.com/Baz00k/resume',
		technologies: ['SvelteKit', 'TypeScript', 'Tailwind CSS', 'Playwright', 'Canvas 2D']
	}
];

export const education: (keyof Messages['education'])[] = ['dsw', 'technikum'];

export const spokenLanguages: { id: keyof Messages['spokenLanguages']; icon: Icon }[] = [
	{ id: 'polish', icon: FlagPoland },
	{ id: 'english', icon: FlagUnitedStates },
	{ id: 'german', icon: FlagGermany }
];

export const contact: { icon: Icon; href: string }[] = [
	{ icon: Email, href: 'mailto:jakub@buzuk.dev' },
	{ icon: LinkedIn, href: 'https://www.linkedin.com/in/jakub-buzuk' },
	{ icon: GitHubMark, href: 'https://github.com/Baz00k' },
	{ icon: Web, href: 'https://buzuk.dev' }
];
