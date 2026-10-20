export const themes = ['light', 'dark'] as const;
export type Theme = (typeof themes)[number];

/** localStorage key read by the inline script in `app.html` before first paint. */
export const themeStorageKey = 'theme';
