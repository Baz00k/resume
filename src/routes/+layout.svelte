<script lang="ts">
	import '../app.postcss';
	import Header from '$components/Header.svelte';
</script>

<Header />
<main class="w-full overflow-x-auto px-2 py-4 print:p-0">
	<div
		class="rounded-lg bg-gray-50 dark:bg-gray-100/10 w-[21cm] min-h-[29.7cm] mx-auto overflow-clip print:m-0 print:absolute print:top-0 print:left-0 print:rounded-none print:w-full"
		id="resume"
	>
		<slot />
	</div>
</main>
