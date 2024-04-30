<script lang="ts">
	export let type: 'inTime' | 'outTime';
	export let fixed = false; // TODO: fix type - or add another so we can also have a seperate icon for linked handles
	export let selected: 'inTime' | 'outTime' | 'block' | null = null;

	$: active = selected == type || selected == 'block';

	export let disabled = false;

	/*
	{#if typeof fixed == 'number'}
	{:else}
	{/if}

	{#if selected == type}s
	{:else}	
	{/if}
*/
</script>

<button
	class="tl-handle tl-{type.toLowerCase()} {active ? 'tl-active' : ''}"
	style={disabled
		? 'cursor: not-allowed'
		: typeof fixed == 'number'
		  ? 'cursor: default'
		  : 'cursor: ew-resize'}
	on:pointerdown
	on:mouseover
	on:focus
	on:mouseleave
/>

<style lang="postcss">
	.tl-handle {
		@apply w-4 overflow-hidden text-center h-full border-black border-opacity-10 bg-white bg-opacity-40;
	}

	.tl-handle:not(.tl-active):hover {
		@apply bg-opacity-60;
	}

	.tl-intime {
		@apply rounded-l-sm;
	}

	.tl-outtime {
		@apply rounded-r-sm;
	}

	.tl-active {
		@apply bg-black bg-opacity-10;
	}
</style>
