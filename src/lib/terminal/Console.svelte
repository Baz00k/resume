<!--
	A Guake-style drop-down terminal as an easter egg, on the web page only.
	Only this small loader ships with the page: ` (or ~) anywhere outside a text field loads
	`Terminal.svelte` and JetBrains Mono on first use, then slides the console down. The same
	key on an empty prompt, Esc, `exit` or ✕ close it; `goto` scrolls the page once closed.
	There is no button: keyboard users find it via the devtools message and the line below
	the card, touch devices go without (an accepted trade-off).
-->
<script lang="ts">
	import type { Component } from 'svelte';
	import { onMount, tick } from 'svelte';
	import type { Locale, Messages } from '#lib/i18n.ts';
	import { reopenKey, terminalFont } from './console.ts';

	let { locale, m }: { locale: Locale; m: Messages } = $props();

	/** The hint's text around the key, which it shows as a keycap. */
	let hint = $derived(m.ui.terminalHint.split('{key}'));

	type TerminalProps = {
		locale: Locale;
		m: Messages;
		active: boolean;
		onclose: () => void;
		onreveal: (block: number) => void;
	};

	let Terminal = $state<Component<TerminalProps>>();
	let dialog = $state<HTMLDialogElement>();
	let open = $state(false);
	// On phones the console fills the visual viewport, so the prompt stays above the keyboard.
	let viewport = $state<{ height: number; top: number }>();
	let opener: HTMLElement | null = null;
	let loading: Promise<void> | undefined;

	/** Fetch the terminal chunk and its font once; later opens are instant. */
	const load = () =>
		(loading ??= (async () => {
			if (!document.querySelector(`link[href="${terminalFont}"]`)) {
				const link = document.createElement('link');
				link.rel = 'stylesheet';
				link.href = terminalFont;
				document.head.append(link);
			}
			Terminal = (await import('./Terminal.svelte')).default;
			await tick();
		})());

	const show = async () => {
		if (open) return;
		opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		await load();
		if (open || !dialog) return;
		dialog.showModal();
		open = true;
	};

	let closing = false;
	/**
	 * Slide up, then close. Driven from script rather than CSS: closing a dialog takes it out of
	 * the top layer at once in browsers without `overlay` transitions (Firefox), so a CSS exit
	 * never shows there. Ease-in, so the panel visibly starts moving before it speeds away.
	 */
	const close = async () => {
		if (!dialog?.open || closing) return;
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return dialog.close();
		closing = true;
		const timing = {
			duration: 220,
			easing: 'cubic-bezier(0.5, 0, 0.75, 0)',
			fill: 'forwards'
		} as const;
		const panel = dialog.animate([{ translate: '0 0' }, { translate: '0 -100%' }], timing);
		const backdrop = dialog.animate([{ opacity: 1 }, { opacity: 0 }], {
			...timing,
			pseudoElement: '::backdrop'
		});
		await panel.finished.catch(() => {});
		dialog.close();
		panel.cancel();
		backdrop.cancel();
		closing = false;
	};

	/** Esc: let the animated close handle it instead of the browser's instant one. */
	const oncancel = (event: Event) => {
		event.preventDefault();
		close();
	};

	/** Runs for every way of closing: `close()`, Esc, and the dialog's own close. */
	const onclose = () => {
		open = false;
		opener?.focus({ preventScroll: true });
		opener = null;
	};

	const reveal = (index: number) => {
		close();
		const target = document.querySelector<HTMLElement>(`[data-block="${index}"]`);
		if (!target) return;
		const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
		window.scrollTo({
			top: target.getBoundingClientRect().top + window.scrollY - 24,
			behavior: reduced ? 'auto' : 'smooth'
		});
		if (!reduced)
			target.animate(
				[
					{ backgroundColor: 'color-mix(in srgb, var(--accent) 14%, transparent)' },
					{ backgroundColor: 'transparent' }
				],
				{ duration: 1600, delay: 300, easing: 'ease-out' }
			);
	};

	const onkeydown = (event: KeyboardEvent) => {
		if (event.code !== 'Backquote' && event.key !== '`' && event.key !== '~') return;
		if (event.ctrlKey || event.metaKey || event.altKey) return;
		const target = event.target as HTMLElement;
		// The terminal's own prompt handles the key itself (it closes only on an empty prompt).
		if (target.closest('input, textarea, select, [contenteditable]')) return;
		event.preventDefault();
		if (open) close();
		else void show();
	};

	onMount(() => {
		const visual = window.visualViewport;
		const sync = () => {
			viewport =
				visual && innerWidth < 640 ? { height: visual.height, top: visual.offsetTop } : undefined;
		};
		sync();
		visual?.addEventListener('resize', sync);
		visual?.addEventListener('scroll', sync);

		if (sessionStorage.getItem(reopenKey)) {
			sessionStorage.removeItem(reopenKey);
			void show();
		} else {
			// For whoever opens devtools on a developer's resume.
			console.info(
				'%c>_ jakub@buzuk.dev%c\n\npsst — press ` anywhere on the page for a terminal.',
				'font: 600 14px "Geist Mono", ui-monospace, monospace; color: #62c073',
				'font: 12px "Geist Mono", ui-monospace, monospace'
			);
		}

		return () => {
			visual?.removeEventListener('resize', sync);
			visual?.removeEventListener('scroll', sync);
		};
	});
</script>

<svelte:window {onkeydown} />

<p
	class="hint mt-6 text-center font-mono text-[11px] text-muted opacity-60 transition-opacity select-none hover:opacity-100 print:hidden"
>
	{hint[0]}<kbd class="rounded border border-line px-1 font-[inherit]">`</kbd>{hint[1]}
</p>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog
	bind:this={dialog}
	class="console fixed inset-x-0 top-0 bottom-auto m-0 h-[62dvh] max-h-none w-full max-w-none overflow-hidden border-0 border-b border-line bg-paper p-0 text-ink shadow-2xl sm:rounded-b-xl sm:border-x"
	style:height={viewport && `${viewport.height}px`}
	style:top={viewport && `${viewport.top}px`}
	aria-label="Terminal"
	{onclose}
	{oncancel}
	onclick={(event) => event.target === dialog && close()}
>
	{#if Terminal}
		<Terminal {locale} {m} active={open} onclose={close} onreveal={reveal} />
	{/if}
</dialog>

<style>
	/* Only devices with a keyboard-ish pointer can press the key. */
	.hint {
		display: none;
	}

	@media (hover: hover) and (pointer: fine) {
		.hint {
			display: block;
		}
	}

	/* Entry only: the transitions live on the open state; `close()` animates the exit. */
	.console {
		translate: 0 -100%;
	}

	.console[open] {
		translate: 0 0;
		transition: translate 0.26s cubic-bezier(0.2, 0.8, 0.2, 1);
	}

	@starting-style {
		.console[open] {
			translate: 0 -100%;
		}
	}

	.console[open]::backdrop {
		background: rgb(0 0 0 / 0.3);
		transition: background 0.26s;
	}

	@starting-style {
		.console[open]::backdrop {
			background: rgb(0 0 0 / 0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.console[open],
		.console[open]::backdrop {
			transition: none;
		}
	}
</style>
