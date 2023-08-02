<script lang="ts">
	import Icon from '@iconify/svelte';
	import { exportToPDF } from '$lib/exportToPDF';
</script>

<header class="flex items-center justify-end p-3 md:px-6 w-full print:hidden">
	<button
		class="flex items-center justify-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-100/10 dark:hover:bg-gray-100/20 py-2 px-4 rounded-full transition-colors duration-300 ease-in-out"
		on:click={exportToPDF}
	>
		<Icon icon="material-symbols:download" class="w-5 h-5 mr-2" />
		PDF
	</button>
</header>
