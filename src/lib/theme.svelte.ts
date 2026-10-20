import { themeStorageKey, type Theme } from '#lib/theme.ts';

// Prerendered HTML cannot know the visitor's theme, so this starts as 'light' and
// `sync()` picks up the value the inline script in `app.html` applied before paint.
let current = $state<Theme>('light');

export const theme = {
	get current() {
		return current;
	},
	sync() {
		current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
	},
	set(value: Theme) {
		current = value;
		document.documentElement.dataset.theme = value;
		try {
			localStorage.setItem(themeStorageKey, value);
		} catch {
			// Storage can be unavailable (privacy modes); the choice then lasts for this page only.
		}
	}
};
