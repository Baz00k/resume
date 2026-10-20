<script lang="ts">
	import { page } from '$app/state';
</script>

{#if page.error}
	<div class="flex h-full w-full flex-col items-center justify-center gap-4 p-4">
		<h1 class="text-6xl">{page.status}</h1>
		<p class="text-lg">{page.error.message}</p>
	</div>
{/if}
