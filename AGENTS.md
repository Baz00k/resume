# PROJECT KNOWLEDGE BASE

SvelteKit static site that renders a bilingual (pl, en) resume and deploys to GitHub Pages.
Stack: Svelte 5 (runes), SvelteKit 3, Vite 8, Tailwind 4, TypeScript 6, oxlint + oxfmt, pnpm.
Scripts live in `package.json`; run `pnpm check` and `pnpm lint` before finishing a change.

## CONTENT

- `messages/{pl,en}.json` hold translatable text only, keyed by stable ids. `pl` is the base locale and defines the shape; `src/lib/i18n.ts` type-checks `en` against it.
- Layout data (ordering, links, icons, years, proper nouns, print/page-break hints) lives in code: `src/lib/resume.ts` and components.
- Routes: `src/routes/[[lang=lang]]/`. `pl` is served at `/`, other locales under `/<locale>/`; `entries()` in each `+page.ts` prerenders them. `(site)/` is the web page, `print/` the A4 layout the PDFs are made from.

## PDF

- `pnpm build` runs `vite build`, then `scripts/pdf.ts` prints `/print/` and `/<locale>/print/` with Playwright into `build/cv/` (each locale × light/dark, paths from `src/lib/pdf.ts`). The header links the PDF matching the current locale and theme.
- `src/lib/print/Paginator.svelte` measures every block of the print layout and packs them onto A4 sheets (`paginate.ts`). Steer breaks in the print page's block list with `keepWithNext` / `breakBefore`, never in the dictionaries.
- The build warns about sheets below the fill thresholds in `scripts/pdf.ts` and fails if content overflows a sheet or the web fonts did not load.
- In dev the PDF button opens the print route instead; it renders, and live-updates, what goes into the PDF (Chromium-made, so other browsers may differ slightly). `vite preview` does not serve `build/cv/`; serve `build/` statically to try the downloads.
- Themes: `data-theme` on `<html>` (inline script in `app.html`, state in `src/lib/theme.svelte.ts`), Tailwind's `dark:` variant follows it.

## CONVENTIONS

- Import app code via `#lib/...` with the real file extension (`#lib/i18n.ts`, `#lib/components/Header.svelte`). Kit loads `src/params.ts` with plain Node, so `.ts` extensions and `with { type: 'json' }` keep it loadable.
- Icons come from `unplugin-icons` as static imports (`~icons/<set>/<name>`, sets from `@iconify-json/*`) so they are inlined in the prerendered HTML.
- Every page is prerendered by `adapter-static` with no fallback; keep routes free of `+server.ts` / `+page.server.ts`.
- Stay on TypeScript 6: `svelte-check` needs the TS compiler API that TS 7 does not ship yet.
