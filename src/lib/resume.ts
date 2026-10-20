// Locale-independent resume data: ordering, links, icons and proper nouns.
// All translatable text lives in `messages/*.json`, keyed by the ids used here.
import type { Component } from 'svelte';
import type { Messages } from '#lib/i18n.ts';

import Apple from '~icons/fa6-brands/apple';
import Linux from '~icons/fa6-brands/linux';
import NodeJs from '~icons/fa6-brands/node-js';
import Windows from '~icons/fa6-brands/windows';
import CSharp from '~icons/devicon/csharp';
import Dart from '~icons/devicon/dart';
import GitHub from '~icons/devicon/github';
import NextJs from '~icons/devicon/nextjs';
import Python from '~icons/devicon/python';
import React from '~icons/devicon/react';
import Traefik from '~icons/devicon/traefikproxy';
import Vue from '~icons/devicon/vuejs';
import Figma from '~icons/logos/figma';
import Firebase from '~icons/logos/firebase-icon';
import Unity from '~icons/logos/unity';
import VisualStudio from '~icons/logos/visual-studio';
import VSCode from '~icons/logos/visual-studio-code';
import Email from '~icons/mdi/email';
import GitHubMark from '~icons/mdi/github';
import HomeAssistant from '~icons/mdi/home-assistant';
import LinkedIn from '~icons/mdi/linkedin';
import Web from '~icons/mdi/web';
import ESPHome from '~icons/simple-icons/esphome';
import Proxmox from '~icons/simple-icons/proxmox';
import Tailscale from '~icons/simple-icons/tailscale';
import Zed from '~icons/simple-icons/zedindustries';
import Bash from '~icons/skill-icons/bash-dark';
import Css from '~icons/skill-icons/css';
import Docker from '~icons/skill-icons/docker';
import Git from '~icons/skill-icons/git';
import Html from '~icons/skill-icons/html';
import JavaScript from '~icons/skill-icons/javascript';
import Neovim from '~icons/skill-icons/neovim-dark';
import Photoshop from '~icons/skill-icons/photoshop';
import Svelte from '~icons/skill-icons/svelte';
import TypeScript from '~icons/skill-icons/typescript';
import WordPress from '~icons/skill-icons/wordpress';
import ReactNative from '~icons/tabler/brand-react-native';
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
		id: 'programmingLanguages',
		skills: [
			{ name: 'TypeScript', icon: TypeScript },
			{ name: 'JavaScript', icon: JavaScript },
			{ name: 'Python', icon: Python },
			{ name: 'C#', icon: CSharp },
			{ name: 'Dart', icon: Dart },
			{ name: 'HTML', icon: Html },
			{ name: 'CSS', icon: Css }
		]
	},
	{
		id: 'technologies',
		skills: [
			{ name: 'React', icon: React },
			{ name: 'Vue', icon: Vue },
			{ name: 'React Native', icon: ReactNative },
			{ name: 'Next.js', icon: NextJs },
			{ name: 'Svelte', icon: Svelte },
			{ name: 'Node.js', icon: NodeJs },
			{ name: 'Git', icon: Git },
			{ name: 'GitHub', icon: GitHub },
			{ name: 'Docker', icon: Docker },
			{ name: 'Traefik', icon: Traefik },
			{ name: 'Tailscale', icon: Tailscale },
			{ name: 'Home Assistant', icon: HomeAssistant },
			{ name: 'ESPHome', icon: ESPHome },
			{ name: 'Proxmox', icon: Proxmox },
			{ name: 'WordPress', icon: WordPress },
			{ name: 'Firebase', icon: Firebase },
			{ name: 'Unity', icon: Unity }
		]
	},
	{
		id: 'operatingSystems',
		skills: [
			{ name: 'Windows', icon: Windows },
			{ name: 'Windows Server', icon: Windows },
			{ name: 'Linux (Debian, Ubuntu, Arch)', icon: Linux },
			{ name: 'macOS', icon: Apple }
		]
	},
	{
		id: 'tools',
		skills: [
			{ name: 'Visual Studio Code', icon: VSCode },
			{ name: 'Neovim', icon: Neovim },
			{ name: 'Visual Studio', icon: VisualStudio },
			{ name: 'Zed', icon: Zed },
			{ name: 'Bash/Zsh', icon: Bash },
			{ name: 'Photoshop', icon: Photoshop },
			{ name: 'Figma', icon: Figma }
		]
	}
];

export const experience: { id: keyof Messages['experience']; url: string }[] = [
	{ id: 'softiq', url: 'https://softiq.pl' },
	{ id: 'julkafit', url: 'https://www.julkamigdalska.pl/' },
	{ id: 'jacekLech', url: 'https://jaceklech.pl' }
];

export const projects: {
	id: keyof Messages['projects'];
	name: string;
	url?: string;
	technologies: string[];
}[] = [
	{
		id: 'jotCli',
		name: 'Jot CLI',
		url: 'https://github.com/Baz00k/jot-cli',
		technologies: ['TypeScript', 'Bun', 'Effect', 'React', 'OpenTUI']
	},
	{
		id: 'homelab',
		name: 'Homelab',
		technologies: ['Proxmox', 'TrueNAS', 'Docker', 'Traefik', 'Tailscale', 'Cloudflare Tunnel']
	},
	{
		id: 'hydroHomie',
		name: 'Hydro Homie',
		url: 'https://github.com/Baz00k/hydro-homie',
		technologies: ['ESPHome', 'ESP32-C6', 'atopile', 'Home Assistant']
	},
	{
		id: 'resumeTemplate',
		name: 'Resume template',
		url: 'https://github.com/Baz00k/resume-template',
		technologies: ['Svelte (SvelteKit)', 'TailwindCSS', 'TypeScript', 'MDsveX']
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
