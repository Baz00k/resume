<script lang="ts">
	import { contact } from '#lib/resume.ts';
</script>

{#each contact as link (link.href)}
	<p class="flex items-center gap-2">
		<link.icon />
		{link.label}
		<a href={link.href} target="_blank" rel="noopener noreferrer" class="print:no-underline">
			{link.text}
		</a>
	</p>
{/each}
