<script lang="ts">
	import Download from '~icons/material-symbols/download';
	import { exportToPDF } from '#lib/exportToPDF.ts';

	const onExportToPDF = () => {
		const resume = document.getElementById('resume');

		if (!resume) return;

		exportToPDF(resume);
	};
</script>

<button
	class="hidden cursor-pointer items-center justify-center rounded-full bg-gray-200 px-4 py-2 transition-colors duration-300 ease-in-out hover:bg-gray-300 md:flex dark:bg-gray-100/10 dark:hover:bg-gray-100/20"
	onclick={onExportToPDF}
>
	<Download class="mr-2 h-5 w-5" />
	PDF
</button>
