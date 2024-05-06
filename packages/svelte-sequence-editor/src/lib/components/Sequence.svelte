<script lang="ts">
	import Layer from './Layer.svelte';
	import Timebar from './Timebar.svelte';
	import type { TSelectedHandle } from '../types';
	import { writable } from 'svelte/store';
	import { uniqueClasses } from '../utils';
	import { setSequenceContext } from './SequenceContext';
	import type { createSequence } from '$lib/createSequence';
	import { cssBackgroundGuides } from '$lib/utils/cssBackgroundGuides';

	export let sequence: ReturnType<typeof createSequence>;
	export let currentTime: null | number = null;

	const sequenceData = sequence.sequence;
	const duration = sequence.duration;
	//let currentWidth: null | number = null;

	const time = writable(currentTime ?? -1);
	const width = writable( 30000);

	const offsetWidth = writable(0);

	const selectedHandle: TSelectedHandle = writable(null);
	const scrubOverride = writable(false);
	const disabled = writable(false);
	const snapTimes = writable([]);

	export let formatTimeFn = (value: number) => `${Math.round(value)}`;

	setSequenceContext({
		time,
		duration,
		sequence: sequenceData,
		width,
		snapTimes,
		selectedHandle,
		scrubOverride,
		formatTimeFn
	});

	$: currentTime = $time;
	let containerClasses = 'tl-sequence-container';

	let className = '';
	export { className as class };

	export let tag = 'div';

	let sequenceEl: HTMLElement | null;

	const handlePointerMove = (e: PointerEvent) => {

		if (!$selectedHandle && !$scrubOverride) {
			const x = e.x - (sequenceEl ? sequenceEl?.getBoundingClientRect().left : 0);  //(sequenceEl?.offsetLeft ?? 0);
			time.set(Math.min(Math.max((x / $width) * $duration, 0), $duration));
		}
	};

	const handlePointerUp = () => {
		selectedHandle.set(null);
	};

	$: background = cssBackgroundGuides($duration, 2000, { lineWidth: 0.5 });

	$: layers = $sequenceData.layers.sort((a, b) => {
		return a.sortIndex - b.sortIndex;
	});
</script>

<!-- Could likely be implemented more elegantly pending popular feature request in svelte, but it works like this -->
<svelte:head>
	<svelte:element this="style">
		:root body *, .tl-handle, .tl-block-marker-interactive {'{'}
		{#if $selectedHandle?.cursor}
			cursor: {$selectedHandle.cursor} !important;
		{/if}
		{'}'}
	</svelte:element>
</svelte:head>

<svelte:window on:pointerup={handlePointerUp} />

<svelte:element
	this={tag}
	bind:this={sequenceEl}
	bind:clientWidth={$width}
	bind:offsetWidth={$offsetWidth}
	on:pointermove={handlePointerMove}
	class={uniqueClasses(`${containerClasses}${className ? ` ${className}` : ''}`)}
	style={background}
	{...$$restProps}
>
	<slot {currentTime} layers={$sequenceData.layers}>
		<slot name="timebar">
			<Timebar {formatTimeFn} />
		</slot>

		<slot name="layers" {layers}>
			{#if layers}
				{#each layers as layer, index (layer.key)}
					<slot name="layer" {layer} {index}>
						<Layer disabled={$disabled} data={layer} {index} />
					</slot>
				{/each}
			{/if}
		</slot>
	</slot>
</svelte:element>

<style lang="postcss">
	.tl-sequence-container {
		@apply select-none border rounded-md overflow-hidden relative text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 z-0;
	}
</style>
