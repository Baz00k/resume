# PROJECT KNOWLEDGE BASE

SvelteKit static site that renders a bilingual (pl, en) resume and deploys to GitHub Pages.
Stack: Svelte 5 (runes), SvelteKit 3, Vite 8, Tailwind 4, TypeScript 6, oxlint + oxfmt, pnpm.
Scripts live in `package.json`; run `pnpm check` and `pnpm lint` before finishing a change.

## CONTENT

- `messages/{pl,en}.json` hold translatable text only, keyed by stable ids. `pl` is the base locale and defines the shape; `src/lib/i18n.ts` type-checks `en` against it.
- Layout data (links, icons, years, proper nouns) lives in `src/lib/resume.ts`. The order of the resume and its page-break hints live in `src/lib/blocks.ts`; `src/lib/components/ResumeBlock.svelte` renders each block for both the web page and the PDF, so there is one layout to edit.
- Routes: `src/routes/[[lang=lang]]/`. `pl` is served at `/`, other locales under `/<locale>/`; `entries()` in each `+page.ts` prerenders them. `(site)/` shows the blocks as one continuous sheet, `print/` packs them onto A4 sheets for the PDFs.

## PDF

- `pnpm build` runs `vite build`, then `scripts/pdf.ts` prints `/print/` and `/<locale>/print/` with Playwright into `build/cv/` (each locale × light/dark, paths from `src/lib/pdf.ts`). The header links the PDF matching the current locale and theme.
- `src/lib/print/Paginator.svelte` measures every block of the print layout and packs them onto A4 sheets (`paginate.ts`). Steer breaks in `src/lib/blocks.ts` with `keepWithNext` / `breakBefore` (the web page ignores them), never in the dictionaries.
- The build warns about sheets below the fill thresholds in `scripts/pdf.ts` and fails if content overflows a sheet or the web fonts did not load.
- In dev the PDF button opens the print route instead; it renders, and live-updates, what goes into the PDF (Chromium-made, so other browsers may differ slightly). `vite preview` does not serve `build/cv/`; serve `build/` statically to try the downloads.
- Block styles use print units (pt, mm); the web page scales them with `zoom`, and container queries (`@xl:`) give narrow screens a stacked layout.
- Themes: `data-theme` on `<html>` (inline script in `app.html`, state in `src/lib/theme.svelte.ts`), Tailwind's `dark:` variant follows it.

## WEB PAGE EXTRAS

- `(site)/+page.svelte` adds two web-only layers around the shared blocks, both off the critical path. `src/lib/components/AsciiField.svelte` is the canvas behind the card: imported once the browser is idle, it stops while hidden or covered by the card and draws one still frame under reduced motion. `src/lib/terminal/` is the easter egg: only `Console.svelte` ships with the page; the backtick key loads `Terminal.svelte` and JetBrains Mono on first use.
- The terminal's own strings (help, errors) stay English in every locale, like its commands; resume text comes from the dictionaries.

## CONVENTIONS

- Import app code via `#lib/...` with the real file extension (`#lib/i18n.ts`, `#lib/components/Header.svelte`). Kit loads `src/params.ts` with plain Node, so `.ts` extensions and `with { type: 'json' }` keep it loadable.
- Icons come from `unplugin-icons` as static imports (`~icons/<set>/<name>`, sets from `@iconify-json/*`) so they are inlined in the prerendered HTML.
- Every page is prerendered by `adapter-static` with no fallback; keep routes free of `+server.ts` / `+page.server.ts`.
- Stay on TypeScript 6: `svelte-check` needs the TS compiler API that TS 7 does not ship yet.
