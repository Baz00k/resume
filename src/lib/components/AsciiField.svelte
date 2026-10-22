<!--
	The ASCII field behind the resume card on the web page (never in the PDF), Canvas 2D only.
	Slow, mildly warped noise reads as soft swells; every cell picks its glyph and opacity from a
	ramp equalised by measured ink, so neighbouring levels differ by a few percent and the waves
	shade smoothly instead of stepping into lines. The pointer is a light that sits on it and
	draws a fading stroke behind it; a few faint blobs wander the margins, and all of them add up
	like metaballs, so they merge into one shape when they meet. A click/tap sends a ring. Cells
	under the card are skipped and the field fades out towards it; the loop stops while (almost)
	none of the field is visible, e.g. on phones.
-->
<script lang="ts">
	let canvas: HTMLCanvasElement;

	/**
	 * Candidates only: the atlas measures their ink and orders them itself. No `-`, `=`, `_`,
	 * `~` or `|` (side by side they join into lines), and no thin tall marks like `'`, `;` or
	 * `!`, which look brighter than their ink and turn the calm areas into noise.
	 */
	const glyphs = '.:+*?icrxzvno%#&$@';
	/** Glyphs per brightness level; each cell keeps one, so even areas read as mixed text. */
	const variants = 3;
	/** Brightness steps per colour tier; adjacent steps differ by ~1.5% of the brightest. */
	const levels = 64;
	/** Colour tiers, from the field's ink to the accent inside the light. */
	const tiers = 4;
	const fontFamily = '"Geist Mono", ui-monospace, monospace';
	/** Seeded-per-load 2D simplex noise in [-1, 1] (Gustavson's reference, trimmed). */
	const simplex = (() => {
		const perm = new Uint8Array(512);
		const base = Array.from({ length: 256 }, (_, i) => i);
		for (let i = 255; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[base[i], base[j]] = [base[j]!, base[i]!];
		}
		for (let i = 0; i < 512; i++) perm[i] = base[i & 255]!;
		const gx = [1, -1, 1, -1, 1, -1, 0, 0];
		const gy = [1, 1, -1, -1, 0, 0, 1, -1];
		const F2 = 0.5 * (Math.sqrt(3) - 1);
		const G2 = (3 - Math.sqrt(3)) / 6;
		const corner = (gi: number, x: number, y: number) => {
			const t = 0.5 - x * x - y * y;
			return t < 0 ? 0 : t * t * t * t * (gx[gi]! * x + gy[gi]! * y);
		};
		return (xin: number, yin: number) => {
			const s = (xin + yin) * F2;
			const i = Math.floor(xin + s);
			const j = Math.floor(yin + s);
			const t = (i + j) * G2;
			const x0 = xin - (i - t);
			const y0 = yin - (j - t);
			const i1 = x0 > y0 ? 1 : 0;
			const j1 = 1 - i1;
			const ii = i & 255;
			const jj = j & 255;
			return (
				70 *
				(corner(perm[ii + perm[jj]!]! & 7, x0, y0) +
					corner(perm[ii + i1 + perm[jj + j1]!]! & 7, x0 - i1 + G2, y0 - j1 + G2) +
					corner(perm[ii + 1 + perm[jj + 1]!]! & 7, x0 - 1 + 2 * G2, y0 - 1 + 2 * G2))
			);
		};
	})();
	/** Mix two `#rrggbb` colours. */
	const channel = (hex: string, at: number) => parseInt(hex.slice(at, at + 2), 16);
	const mix = (from: string, to: string, t: number) => {
		const out = [1, 3, 5].map((at) =>
			Math.round(channel(from, at) + (channel(to, at) - channel(from, at)) * t)
		);
		return `rgb(${out.join(' ')})`;
	};
	/** A fixed pseudo-random value in [0, 1) per cell. */
	const hash = (x: number, y: number) => {
		const h = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
		return h - Math.floor(h);
	};
	/**
	 * The field's resting brightness (0..~0.2) at a pixel and time: one octave of noise, mildly
	 * warped by another, gives broad, low-contrast swells.
	 */
	const swell = (x: number, y: number, time: number) => {
		const s = 0.0009;
		const q = simplex(x * s * 0.7 + time, y * s * 0.7 - time);
		const v = simplex(x * s + 0.6 * q + time * 0.4, y * s - 0.6 * q);
		return 0.015 + 0.13 * smoothstep(-0.7, 0.9, v);
	};

	const clamp = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value);
	const smoothstep = (from: number, to: number, value: number) => {
		const t = clamp((value - from) / (to - from));
		return t * t * (3 - 2 * t);
	};

	$effect(() => {
		const context = canvas.getContext('2d')!;
		const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

		let width = 0;
		let height = 0;
		let dpr = 1;
		let cellW = 0;
		let cellH = 0;
		let cols = 0;
		let rows = 0;
		let atlas: HTMLCanvasElement | undefined;
		/** The waves, sampled every other cell (they are smooth) and interpolated when drawn. */
		let waves = new Float32Array(0);
		let waveCols = 0;
		/** What each cell shows now: (tier * variants + variant) * levels + level, 0 for empty. */
		let painted = new Uint16Array(0);

		/** Where the pointer is, and the light gliding after it with its presence eased 0..1. */
		const pointer = { x: 0, y: 0, active: false };
		const light = { x: 0, y: 0, strength: 0, placed: false };
		const trail: { x: number; y: number; born: number }[] = [];
		const ripples: { x: number; y: number; start: number }[] = [];
		/** Faint blobs wandering on slow Lissajous paths; seeded per load. */
		const blobs = Array.from({ length: 4 }, () => ({
			x: Math.random(),
			y: Math.random(),
			fx: 0.00004 + Math.random() * 0.00004,
			fy: 0.00003 + Math.random() * 0.00004,
			phase: Math.random() * 6.3
		}));
		let card = { left: 0, top: 0, right: 0, bottom: 0 };
		// The header controls have translucent backgrounds; keep glyphs out from under them too.
		let controls: DOMRect[] = [];
		let controlsBottom = 0;

		const readCard = () => {
			const rect = document.querySelector('main article')?.getBoundingClientRect();
			card = rect
				? { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom }
				: { left: 0, top: 0, right: 0, bottom: 0 };
			controls = [
				...document.querySelectorAll('body header:not(main header) :is(a, button, select)')
			].map((element) => element.getBoundingClientRect());
			controlsBottom = Math.max(0, ...controls.map((control) => control.bottom));
		};
		const underControls = (x: number, y: number) =>
			y < controlsBottom &&
			controls.some((rect) => x > rect.left && x < rect.right && y > rect.top && y < rect.bottom);
		/** Distance from the card's edge, 0 on or under it. */
		const fromCard = (x: number, y: number) => {
			const dx = Math.max(card.left - x, 0, x - card.right);
			const dy = Math.max(card.top - y, 0, y - card.bottom);
			return dx || dy ? Math.hypot(dx, dy) : 0;
		};
		/** Share of the viewport the card leaves uncovered. */
		const visibleShare = () => {
			const w = Math.max(0, Math.min(card.right, width) - Math.max(card.left, 0));
			const h = Math.max(0, Math.min(card.bottom, height) - Math.max(card.top, 0));
			return 1 - (w * h) / (width * height);
		};

		const fontSize = () => (width < 640 ? 13 : 12);

		/**
		 * One row per colour tier; per variant, one column per brightness level. Each level gets
		 * the lightest glyphs with enough ink for it and the opacity that brings them to exactly
		 * that brightness, so brightness rises linearly while the glyphs change along the ramp.
		 */
		const buildAtlas = () => {
			const styles = getComputedStyle(document.documentElement);
			const dark = document.documentElement.dataset.theme === 'dark';
			const read = (name: string, fallback: string) =>
				styles.getPropertyValue(name).trim() || fallback;
			const ink = read('--ink', dark ? '#ededed' : '#171717');
			const accent = read('--accent', dark ? '#52a8ff' : '#0068d6');
			// Dark glyphs on a light page look thinner and fainter than light ones on a dark page
			// at the same opacity, so the light theme draws them a weight heavier and less dimmed.
			const font = `${dark ? 400 : 500} ${fontSize()}px ${fontFamily}`;
			const sw = Math.ceil(cellW * dpr);
			const sh = Math.ceil(cellH * dpr);

			// Measure each glyph's ink: the share of the cell it covers.
			const probe = document.createElement('canvas');
			probe.width = sw;
			probe.height = sh;
			const pen = probe.getContext('2d', { willReadFrequently: true })!;
			pen.scale(dpr, dpr);
			pen.font = font;
			pen.textAlign = 'center';
			pen.textBaseline = 'middle';
			const measured = [...glyphs]
				.map((glyph) => {
					pen.clearRect(0, 0, cellW, cellH);
					pen.fillText(glyph, cellW / 2, cellH / 2);
					const { data } = pen.getImageData(0, 0, sw, sh);
					let sum = 0;
					for (let i = 3; i < data.length; i += 4) sum += data[i]!;
					return { glyph, ink: sum / 255 };
				})
				.filter((entry) => entry.ink > 0)
				.toSorted((a, b) => a.ink - b.ink);
			const most = measured.at(-1)!.ink;

			const sheet = document.createElement('canvas');
			sheet.width = variants * (levels + 1) * sw;
			sheet.height = tiers * sh;
			const ctx = sheet.getContext('2d')!;
			ctx.scale(dpr, dpr);
			ctx.font = font;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			// The brightest a glyph gets: the field stays behind the card, never competes with it.
			const ceiling = dark ? 0.8 : 0.92;
			for (let tier = 0; tier < tiers; tier++) {
				ctx.fillStyle = mix(ink, accent, tier / (tiers - 1));
				for (let level = 1; level <= levels; level++) {
					const want = (level / levels) * most;
					// The lightest few glyphs with enough ink, each dimmed to exactly this level.
					const enough = measured.filter((entry) => entry.ink >= want).slice(0, variants);
					for (let variant = 0; variant < variants; variant++) {
						const pick = enough[variant % enough.length]!;
						const share = want / pick.ink;
						ctx.globalAlpha = (dark ? share : share ** 0.8) * ceiling;
						ctx.fillText(
							pick.glyph,
							((variant * (levels + 1) + level) * sw) / dpr + cellW / 2,
							(tier * sh) / dpr + cellH / 2
						);
					}
				}
			}
			atlas = sheet;
			repaintAll();
		};

		const resize = () => {
			width = window.innerWidth;
			height = window.innerHeight;
			dpr = Math.min(window.devicePixelRatio || 1, 2);
			canvas.width = Math.round(width * dpr);
			canvas.height = Math.round(height * dpr);
			const size = fontSize();
			cellW = Math.ceil(size * 0.66);
			cellH = Math.ceil(size * 1.3);
			cols = Math.ceil(width / cellW);
			rows = Math.ceil(height / cellH);
			waveCols = Math.ceil(cols / 2) + 1;
			waves = new Float32Array(waveCols * (Math.ceil(rows / 2) + 1));
			painted = new Uint16Array(cols * rows);
			readCard();
			buildAtlas();
		};

		/** Sample the waves for time `t`: noise warped by noise, drifting slowly. */
		const stepWaves = (t: number) => {
			const time = t * 0.00004;
			const waveRows = waves.length / waveCols;
			for (let gy = 0; gy < waveRows; gy++) {
				const py = (gy * 2 + 0.5) * cellH;
				for (let gx = 0; gx < waveCols; gx++) {
					waves[gy * waveCols + gx] = swell((gx * 2 + 0.5) * cellW, py, time);
				}
			}
		};
		const waveAt = (col: number, row: number) => {
			const gx = col >> 1;
			const gy = row >> 1;
			const fx = (col & 1) * 0.5;
			const fy = (row & 1) * 0.5;
			const at = gy * waveCols + gx;
			const top = waves[at]! + (waves[at + 1]! - waves[at]!) * fx;
			const bottom =
				waves[at + waveCols]! + (waves[at + waveCols + 1]! - waves[at + waveCols]!) * fx;
			return top + (bottom - top) * fy;
		};

		/** Keep the light on the pointer and drop trail points behind it. */
		const stepLight = (dt: number, now: number) => {
			if (pointer.active) {
				if (!light.placed) {
					light.x = pointer.x;
					light.y = pointer.y;
					light.placed = true;
				}
				// No glide: the light sits on the pointer; the trail is what lingers.
				light.x = pointer.x;
				light.y = pointer.y;
				const last = trail.at(-1);
				if (!last || (now - last.born > 15 && Math.hypot(light.x - last.x, light.y - last.y) > 6)) {
					trail.push({ x: light.x, y: light.y, born: now });
					if (trail.length > 14) trail.shift();
				}
			}
			light.strength +=
				((pointer.active ? 1 : 0) - light.strength) *
				(1 - Math.exp(-dt * (pointer.active ? 20 : 4)));
			if (light.strength < 0.01) light.placed = false;
			while (trail.length && now - trail[0]!.born > 2400) trail.shift();
		};

		/** One Gaussian bump of the metaball field: centre, squared radius, peak. */
		type Ball = { x: number; y: number; r2: number; peak: number };
		let balls: Ball[] = [];
		/** Trail segments: start, offset to the end, peaks at both ends and a bounding box. */
		type Stroke = {
			ax: number;
			ay: number;
			dx: number;
			dy: number;
			len2: number;
			peakA: number;
			peakB: number;
			r2: number;
			left: number;
			right: number;
			top: number;
			bottom: number;
		};
		let strokes: Stroke[] = [];
		/** The band of rows the balls can reach; rows outside it skip them. */
		let ballsTop = 0;
		let ballsBottom = 0;
		const collectBalls = (now: number) => {
			const radius = width < 640 ? 70 : 95;
			balls = [];
			if (light.strength > 0.01) {
				balls.push({ x: light.x, y: light.y, r2: radius * radius, peak: light.strength });
			}
			// The trail is a stroke through its points (and on to the light), however far apart
			// a fast move spaced them, tapering as the points age.
			strokes = [];
			const path = light.strength > 0.01 ? [...trail, { ...light, born: now }] : trail;
			const r2 = radius * radius * 0.5;
			const reach = radius * 2.2;
			for (let i = 1; i < path.length; i++) {
				const a = path[i - 1]!;
				const b = path[i]!;
				strokes.push({
					ax: a.x,
					ay: a.y,
					dx: b.x - a.x,
					dy: b.y - a.y,
					len2: (b.x - a.x) ** 2 + (b.y - a.y) ** 2,
					peakA: 0.8 * Math.exp(-(now - a.born) / 700),
					peakB: 0.8 * Math.exp(-(now - b.born) / 700),
					r2,
					left: Math.min(a.x, b.x) - reach,
					right: Math.max(a.x, b.x) + reach,
					top: Math.min(a.y, b.y) - reach,
					bottom: Math.max(a.y, b.y) + reach
				});
			}
			for (const blob of blobs) {
				balls.push({
					x: (0.5 + 0.5 * Math.sin(now * blob.fx + blob.phase + blob.x * 6)) * width,
					y: (0.5 + 0.5 * Math.sin(now * blob.fy + blob.phase * 1.7 + blob.y * 6)) * height,
					r2: radius * radius * 1.3,
					peak: 0.3
				});
			}
			ballsTop = Math.min(
				...balls.map((ball) => ball.y - Math.sqrt(ball.r2) * 3),
				...strokes.map((stroke) => stroke.top)
			);
			ballsBottom = Math.max(
				...balls.map((ball) => ball.y + Math.sqrt(ball.r2) * 3),
				...strokes.map((stroke) => stroke.bottom)
			);
		};

		const draw = (now: number) => {
			if (!atlas) return;
			context.setTransform(dpr, 0, 0, dpr, 0, 0);
			while (ripples.length && now - ripples[0]!.start > 1600) ripples.shift();
			const fade = width < 640 ? 32 : 72;

			for (let row = 0; row < rows; row++) {
				const y = row * cellH + cellH / 2;
				const reached = y > ballsTop && y < ballsBottom;
				for (let col = 0; col < cols; col++) {
					const x = col * cellW + cellW / 2;
					const index = row * cols + col;
					const gap = fromCard(x, y);
					if (gap === 0 || underControls(x, y)) {
						paint(index, 0, x, y);
						continue;
					}

					// Soft waves, quieter next to the card so its edge stays calm.
					let value = waveAt(col, row) * (0.35 + 0.65 * smoothstep(0, fade, gap));

					// The metaball field: Gaussian bumps that add up, so close ones merge.
					let field = 0;
					if (reached)
						for (const ball of balls) {
							const dx = x - ball.x;
							const dy = y - ball.y;
							const d2 = dx * dx + dy * dy;
							if (d2 < ball.r2 * 9) field += ball.peak * Math.exp(-d2 / ball.r2);
						}
					// Segments overlap at their joints, so the stroke takes the strongest one rather
					// than their sum (which would bead at every joint), then joins the bumps.
					let stroke = 0;
					if (reached)
						for (const segment of strokes) {
							if (x < segment.left || x > segment.right || y < segment.top || y > segment.bottom)
								continue;
							const t = segment.len2
								? clamp(
										((x - segment.ax) * segment.dx + (y - segment.ay) * segment.dy) / segment.len2
									)
								: 0;
							const ox = x - segment.ax - segment.dx * t;
							const oy = y - segment.ay - segment.dy * t;
							const peak = segment.peakA + (segment.peakB - segment.peakA) * t;
							stroke = Math.max(stroke, peak * Math.exp(-(ox * ox + oy * oy) / segment.r2));
						}
					field += stroke;
					// Inside the surface the cells fill in; around it the waves lift. A little fixed
					// grain per cell keeps the light a shimmer of glyphs rather than a solid patch.
					const body = smoothstep(0.5, 0.95, field);
					const grain = 0.75 + 0.5 * hash(col, row);
					value = value * (1 + field * 1.4) + (body * 0.24 + field * 0.06) * grain;

					for (const ripple of ripples) {
						const age = (now - ripple.start) / 1600;
						const radius = age * (width < 640 ? 380 : 560);
						const off = (Math.hypot(x - ripple.x, y - ripple.y) - radius) / 26;
						value += Math.exp(-off * off) * (1 - age) * 0.25;
					}

					const level = Math.round(clamp(value) * levels);
					const tier = Math.min(tiers - 1, Math.floor(body * tiers));
					const variant = Math.floor(hash(col + 31, row + 17) * variants);
					paint(index, level === 0 ? 0 : (tier * variants + variant) * levels + level, x, y);
				}
			}
		};

		/**
		 * Only touch cells whose glyph changed since the last frame: the field drifts slowly,
		 * so most cells stay put and redrawing all of them would dominate the frame.
		 */
		const paint = (index: number, code: number, x: number, y: number) => {
			if (painted[index] === code) return;
			painted[index] = code;
			const left = x - cellW / 2;
			const top = y - cellH / 2;
			context.clearRect(left, top, cellW, cellH);
			if (code === 0) return;
			const sw = Math.ceil(cellW * dpr);
			const sh = Math.ceil(cellH * dpr);
			const level = ((code - 1) % levels) + 1;
			const rest = (code - level) / levels;
			const column = (rest % variants) * (levels + 1) + level;
			const tier = Math.floor(rest / variants);
			context.drawImage(atlas!, column * sw, tier * sh, sw, sh, left, top, cellW, cellH);
		};
		/** Forget what is on the canvas, so the next frame repaints every cell. */
		const repaintAll = () => {
			context.setTransform(1, 0, 0, 1, 0, 0);
			context.clearRect(0, 0, canvas.width, canvas.height);
			painted.fill(0);
		};

		let frame = 0;
		let last = 0;
		let running = false;
		let ticks = 0;
		const tick = (now: number, dt: number) => {
			// The waves drift slowly; resampling them every other frame is invisible.
			if (ticks++ % 2 === 0) stepWaves(now);
			stepLight(dt, now);
			collectBalls(now);
			readCard();
			draw(now);
		};
		const loop = (now: number) => {
			if (document.hidden || visibleShare() < 0.06) {
				running = false;
				return;
			}
			frame = requestAnimationFrame(loop);
			if (now - last < 1000 / 60 - 2) return;
			const dt = Math.min(now - last, 100) / 1000;
			last = now;
			tick(now, dt);
		};
		/** (Re)start the loop when there is something to show; the loop stops itself otherwise. */
		const start = () => {
			readCard();
			if (running || reduced || !atlas || document.hidden || visibleShare() < 0.06) return;
			running = true;
			last = performance.now();
			frame = requestAnimationFrame(loop);
		};

		const onMove = (event: PointerEvent) => {
			pointer.x = event.clientX;
			pointer.y = event.clientY;
			pointer.active = true;
		};
		const onDown = (event: PointerEvent) => {
			onMove(event);
			ripples.push({ x: event.clientX, y: event.clientY, start: performance.now() });
		};
		const onUp = (event: PointerEvent) => {
			if (event.pointerType !== 'mouse') pointer.active = false;
		};
		const onOut = (event: PointerEvent) => {
			if (!event.relatedTarget) pointer.active = false;
		};
		const onResize = () => {
			resize();
			if (reduced) renderStatic();
			else start();
		};

		/** Reduced motion: one still frame, no animation, no pointer response. */
		const renderStatic = () => {
			const now = performance.now();
			stepWaves(now);
			collectBalls(now);
			readCard();
			draw(now);
		};

		const observer = new MutationObserver(() => {
			buildAtlas();
			if (reduced) renderStatic();
		});
		observer.observe(document.documentElement, { attributeFilter: ['data-theme'] });

		let cancelled = false;
		resize();
		Promise.all(
			[400, 500].map((weight) => document.fonts.load(`${weight} ${fontSize()}px ${fontFamily}`))
		).finally(() => {
			if (cancelled) return;
			buildAtlas();
			if (reduced) renderStatic();
			else start();
		});
		window.addEventListener('resize', onResize);
		if (!reduced) {
			window.addEventListener('scroll', start, { passive: true });
			window.addEventListener('pointermove', onMove, { passive: true });
			window.addEventListener('pointerdown', onDown, { passive: true });
			window.addEventListener('pointerup', onUp, { passive: true });
			window.addEventListener('pointercancel', onUp, { passive: true });
			document.addEventListener('pointerout', onOut);
			document.addEventListener('visibilitychange', start);
		}

		return () => {
			cancelled = true;
			cancelAnimationFrame(frame);
			observer.disconnect();
			window.removeEventListener('resize', onResize);
			window.removeEventListener('scroll', start);
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerdown', onDown);
			window.removeEventListener('pointerup', onUp);
			window.removeEventListener('pointercancel', onUp);
			document.removeEventListener('pointerout', onOut);
			document.removeEventListener('visibilitychange', start);
		};
	});
</script>

<canvas bind:this={canvas} class="field block size-full"></canvas>

<style>
	/* The field is loaded after the page, so fade it in instead of popping. */
	.field {
		animation: appear 1.2s ease-out;
	}

	@keyframes appear {
		from {
			opacity: 0;
		}
	}
</style>
