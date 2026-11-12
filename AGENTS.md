# AGENTS.md

Jakub Buzuk's bilingual (pl, en) resume: a prerendered SvelteKit site plus build-time PDFs rendered from the same blocks.

The site is a portfolio piece: impressive, yet readable as a plain resume at first glance and fast to load. The PDF stays clean and ATS-readable. Content states only real facts, with client project names anonymised.

**Done** when `pnpm check`, `pnpm lint` and `pnpm test` pass, plus a warning-free `pnpm build` when the change can move content between PDF pages.

## Rules

- `messages/*.json` hold translatable text only; layout data and page-break hints live in `src/lib/`.
- Locales are declared once in `src/lib/i18n.ts`: a `messages/<locale>.json` plus that locale's entries in the records there, which the type checker requires.
- The terminal easter egg's own strings stay English in every locale.
- Stay on TypeScript 6.
- Node and pnpm versions are pinned in `mise.toml`; keep them in step with CI and `packageManager`.
