# PROJECT KNOWLEDGE BASE

SvelteKit static site that renders a bilingual (pl, en) resume and deploys to GitHub Pages.
Stack: Svelte 5 (runes), SvelteKit 3, Vite 8, Tailwind 4, TypeScript 6, oxlint + oxfmt, pnpm.
Scripts live in `package.json`; run `pnpm check` and `pnpm lint` before finishing a change.

## CONTENT

- `messages/{pl,en}.json` hold translatable text only, keyed by stable ids. `pl` is the base locale and defines the shape; `src/lib/i18n.ts` type-checks `en` against it.
- Layout data (ordering, links, icons, years, proper nouns, print/page-break hints) lives in code: `src/lib/resume.ts` and components.
- Routes: `src/routes/[[lang=lang]]/`. `pl` is served at `/`, other locales under `/<locale>/`; `entries()` in `+page.ts` prerenders them.

## CONVENTIONS

- Import app code via `#lib/...` with the real file extension (`#lib/i18n.ts`, `#lib/components/Header.svelte`). Kit loads `src/params.ts` with plain Node, so `.ts` extensions and `with { type: 'json' }` keep it loadable.
- Icons come from `unplugin-icons` as static imports (`~icons/<set>/<name>`, sets from `@iconify-json/*`) so they are inlined in the prerendered HTML.
- Every page is prerendered by `adapter-static` with no fallback; keep routes free of `+server.ts` / `+page.server.ts`.
- Stay on TypeScript 6: `svelte-check` needs the TS compiler API that TS 7 does not ship yet.
