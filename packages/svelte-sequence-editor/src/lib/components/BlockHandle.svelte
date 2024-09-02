<!-- @component `BlockHandle` must be descendent of `SequenceBlock`. -->

<script lang="ts">
	import type { Block } from '../Sequence';
	import { getSequenceContext } from './SequenceContext';

	const { time, selectedHandle, scrubOverride, snapTimes } = getSequenceContext();

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let type: 'inTime' | 'outTime';
	export let selected: 'inTime' | 'outTime' | 'block' | null = null;

	$: active = selected == type || selected == 'block';

	export let disabled = false;
	export let block: Block;

	export let fixed = typeof block?.validations?.[type]?.fixed == 'number';

	$: absoluteTime = type == 'inTime' ? block.absoluteInTime : block.absoluteOutTime;

	const selectHandle = (e: PointerEvent) => {
		e.preventDefault();
		if (disabled || fixed) return;

		$snapTimes = [];
		scrubOverride.set(true);

		selectedHandle.set({
			//layer: block.get,
			block: block,
			handle: type,
			cursor: 'ew-resize'
		});

		time.set(absoluteTime);

		dispatch('selectHandle', {
			block,
			type
		});
	};

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
	class="tl-handle tl-{type.toLowerCase()}"
	class:at-playhead={block && $time == absoluteTime}
	class:tl-active={active}
	style={$selectedHandle
		? ''
		: disabled
			? 'cursor: not-allowed'
			: fixed
				? 'cursor: not-allowed'
				: 'cursor: ew-resize'}
	on:pointerdown={selectHandle}
	on:mouseover={() => {
		if ($selectedHandle) return;
		scrubOverride.set(true);
		time.set(absoluteTime);
	}}
	on:mouseleave={() => {
		if ($selectedHandle) return;
		scrubOverride.set(false);
	}}
	on:focus
/>

<style lang="postcss">
	.tl-handle {
		@apply w-4 overflow-hidden text-center h-full bg-gray-900 bg-opacity-20 dark:bg-white dark:bg-opacity-30;
	}

	.tl-handle:not(.tl-active):hover {
		@apply bg-opacity-60 dark:bg-opacity-60;
	}

	.tl-intime {
		@apply rounded-l-sm;
	}

	.tl-outtime {
		@apply rounded-r-sm;
	}

	.tl-active {
		@apply bg-black bg-opacity-70 dark:bg-white dark:bg-opacity-70;
	}

	.at-playhead {
		@apply border-red-800 dark:border-red-400;
	}
	.tl-intime.at-playhead {
		@apply border-l-2;
	}
	.tl-outtime.at-playhead {
		@apply border-r-2;
	}
</style>
