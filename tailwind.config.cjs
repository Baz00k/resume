import typography from '@tailwindcss/typography';
import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config}*/
const config = {
	content: ['./src/**/*.{html,js,svelte,ts,md,svx}'],

	theme: {
		extend: {
			colors: {
				dark: '#0f172a'
			},
			typography: {
				blue: {
					css: {
						'--tw-prose-body': colors.black[950],
						'--tw-prose-headings': colors.black,
						'--tw-prose-lead': colors.blue[900],
						'--tw-prose-links': colors.blue[900],
						'--tw-prose-bold': colors.blue[900],
						'--tw-prose-counters': colors.blue[900],
						'--tw-prose-bullets': colors.blue[200],
						'--tw-prose-hr': colors.blue[200],
						'--tw-prose-quotes': colors.blue[900],
						'--tw-prose-quote-borders': colors.blue[200],
						'--tw-prose-captions': colors.blue[500],
						'--tw-prose-code': colors.blue[950],
						'--tw-prose-pre-code': colors.blue[200],
						'--tw-prose-pre-bg': colors.blue[800],
						'--tw-prose-th-borders': colors.blue[300],
						'--tw-prose-td-borders': colors.blue[200],
						'--tw-prose-invert-body': colors.sky[50],
						'--tw-prose-invert-headings': colors.white,
						'--tw-prose-invert-lead': colors.blue[400],
						'--tw-prose-invert-links': colors.white,
						'--tw-prose-invert-bold': colors.white,
						'--tw-prose-invert-counters': colors.blue[100],
						'--tw-prose-invert-bullets': colors.blue[300],
						'--tw-prose-invert-hr': colors.blue[900],
						'--tw-prose-invert-quotes': colors.blue[100],
						'--tw-prose-invert-quote-borders': colors.blue[700],
						'--tw-prose-invert-captions': colors.blue[400],
						'--tw-prose-invert-code': colors.white,
						'--tw-prose-invert-pre-code': colors.blue[300],
						'--tw-prose-invert-pre-bg': 'rgb(0 0 0 / 50%)',
						'--tw-prose-invert-th-borders': colors.blue[600],
						'--tw-prose-invert-td-borders': colors.blue[700],
						'font-family': 'Poppins, system-ui, sans-serif',
						h1: {
							'font-weight': '600',
						}
					},
				},

			}
		}
	},

	plugins: [typography]
};

module.exports = config;
