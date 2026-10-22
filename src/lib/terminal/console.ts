// Shared by `Console.svelte` and `Terminal.svelte`.

/** Set before `lang` reloads the page, so the console opens again on the new one. */
export const reopenKey = 'console-reopen';
/** The terminal's font, loaded the first time the console opens. */
export const terminalFont =
	'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap';
