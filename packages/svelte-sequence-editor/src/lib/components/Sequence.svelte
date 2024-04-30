<script lang="ts">
	import Layer from './Layer.svelte';
	import Timebar from './Timebar.svelte';
	import type { SequenceContext, TSelectedHandle } from '../types';
	import { key } from './key';
	import { writable } from 'svelte/store';
	import { uniqueClasses } from '../utils';
	import { setContext } from 'svelte';
	import type { createSequence } from '$lib/createSequence';

	export let sequence: ReturnType<typeof createSequence>;
	export let currentTime: null | number = null;

	const sequenceData = sequence.sequence;
	const duration = sequence.duration;

	let currentWidth: null | number = null;

	const time = writable(currentTime ?? -1);
	const width = writable(currentWidth ?? 30000);

	const selectedHandle: TSelectedHandle = writable(null);
	const scrubOverride = writable(false);
	const disabled = writable(false);

	const context: SequenceContext = {
		time,
		duration,
		sequence: sequenceData,
		width,
		selectedHandle,
		scrubOverride,
		setTime: (_value) => time.set(_value)
	};

	setContext(key, context);

	$: currentTime = $time;
	let containerClasses = 'tl-sequence-container';

	let className = '';
	export { className as class };

	export let tag = 'div';

	let sequenceEl: HTMLElement | null;

	const handlePointerMove = (e: PointerEvent) => {
		if (!$selectedHandle && !$scrubOverride) {
			const x = e.clientX - (sequenceEl?.offsetLeft ?? 0);
			time.set(Math.min(Math.max((x / $width) * $duration, 0), $duration));
		}
	};

	const handlePointerUp = () => {
		//const x = e.clientX - (sequenceEl?.offsetLeft ?? 0);
		//time.set(Math.min(Math.max((x / $width) * $duration, 0), $duration));
		selectedHandle.set(null);
	};

	const getGridBackground = (duration: number, millis = 2000, lineWidth = 0.5, color = '#9993') => {
		const divisions = duration / millis;
		const divisionsPercent = 100 / divisions;
		return `background-image: 
			linear-gradient(90deg, ${color} ${lineWidth}px, transparent ${lineWidth}px, transparent calc(100% - ${lineWidth}px), ${color} calc(100% - ${lineWidth}px));
			background-size: ${divisionsPercent}% 100%;`;
	};

	$: gridBackground = getGridBackground($duration);
</script>

<!-- Could likely be implemented more elegantly pending popular feature request in svelte, but it works like this -->
<svelte:head>
	<svelte:element this="style">
		:root {'{'}
		{#if $selectedHandle?.cursor}
			cursor: {$selectedHandle.cursor};
		{/if}
		{'}'}
	</svelte:element>
</svelte:head>

<svelte:window on:pointerup={handlePointerUp} />

<svelte:element
	this={tag}
	bind:this={sequenceEl}
	bind:clientWidth={$width}
	on:pointermove={handlePointerMove}
	class={uniqueClasses(`${containerClasses}${className ? ` ${className}` : ''}`)}
	style={gridBackground}
	{...$$restProps}
>
	<slot {currentTime} setTime={context.setTime} layers={$sequenceData.layers}>
		<Timebar />

		{#if $sequenceData.layers}
			{#each $sequenceData.layers as layer (layer.key)}
				<Layer disabled={$disabled} data={layer} />
			{/each}
		{/if}
	</slot>
</svelte:element>

<style lang="postcss">
	.tl-sequence-container {
		@apply select-none pb-6 border rounded-md overflow-hidden relative;
	}
</style>
