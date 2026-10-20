<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { theme } from '#lib/theme.svelte.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	onMount(theme.sync);
</script>

{@render children()}
