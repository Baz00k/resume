import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config}*/
const config = {
	content: ['./src/**/*.{html,js,svelte,ts,md,mdx,svx}'],
	safelist: ['iconify'],

	theme: {
		extend: {
			colors: {
				dark: '#0f172a',
				tokyo: {
					light: '#f4f4f6',
					night: '#1a1b26',
					storm: '#24283b'
				}
			},
			typography: {
				tokyo: {
					css: {
						'--tw-prose-body': '#0f0f14',
						'--tw-prose-headings': '#343b58',
						'--tw-prose-lead': '#565a6e',
						'--tw-prose-links': '#33635c',
						'--tw-prose-bold': '#0f0f14',
						'--tw-prose-counters': '#565a6e',
						'--tw-prose-bullets': '#565a6e',
						'--tw-prose-hr': '#343b58',
						'--tw-prose-quotes': '#0f0f14',
						'--tw-prose-quote-borders': '#9699a3',
						'--tw-prose-captions': '#565a6e',
						'--tw-prose-code': '#0f0f14',
						'--tw-prose-pre-code': '#e0af68',
						'--tw-prose-pre-bg': '#1a1b26',
						'--tw-prose-th-borders': '#343b58',
						'--tw-prose-td-borders': '#565a6e',
						'--tw-prose-invert-body': '#b4f9f8',
						'--tw-prose-invert-headings': '#d9fcfb',
						'--tw-prose-invert-lead': '#c6faf9',
						'--tw-prose-invert-links': '#73daca',
						'--tw-prose-invert-bold': '#c6faf9',
						'--tw-prose-invert-counters': '#c6faf9',
						'--tw-prose-invert-bullets': '#c6faf9',
						'--tw-prose-invert-hr': '#a9b1d6',
						'--tw-prose-invert-quotes': '#c6faf9',
						'--tw-prose-invert-quote-borders': '#565f89',
						'--tw-prose-invert-captions': '#c6faf9',
						'--tw-prose-invert-code': '#d9fcfb',
						'--tw-prose-invert-pre-code': '#e0af68',
						'--tw-prose-invert-pre-bg': '#343b58',
						'--tw-prose-invert-th-borders': '#a9b1d6',
						'--tw-prose-invert-td-borders': '#414868',
						'font-family': 'Poppins, system-ui, sans-serif',
						h1: {
							'font-family': 'Raleway, system-ui, sans-serif',
							'font-weight': '400'
						}
					}
				}
			}
		}
	},

	plugins: [typography, forms]
};

module.exports = config;
