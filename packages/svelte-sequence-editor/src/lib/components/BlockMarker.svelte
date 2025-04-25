<script lang="ts">
	import type { Block } from '../Sequence';
	import { getSequenceContext } from './SequenceContext';

	export let time: number;
	export let index: number;
	export let title = `Marker #${index + 1}`;

	export let disableSnapping = false;
	export let block: Block;

	export let tag = 'div';

	const { duration, width, scrubOverride, time: playheadTime, formatTimeFn } = getSequenceContext();

	//export let format = (value: number) => `${Math.round(value)}`;

	export let formatTitle = () => {
		return `${title} (+${formatTimeFn(time)})`;
	};

	$: timeToPixel = (1 / $duration) * $width;
	$: absoluteTime = time + block.absoluteInTime;

	//$: active = $playheadTime == absoluteTime;
</script>

<svelte:element
	this={tag}
	class="tl-block-marker-wrapper"
	style="left: {time * timeToPixel}px; top: 0;"
>
	<!-- Render transparent interactive marker above block content (block handle)-->
	<div
		title={formatTitle()}
		class="tl-block-marker-interactive"
		on:pointerdown
		on:focus
		on:mouseover={() => {
			if (disableSnapping) return;
			scrubOverride.set(true);
			playheadTime.set(absoluteTime);
		}}
		on:mouseleave={() => {
			if (disableSnapping) return;
			scrubOverride.set(false);
		}}
		role="note"
	>
		<!--<span class="text-xs z-5">{index + 1}</span>-->
	</div>

	<!-- Render graphic marker under block content-->
	<div
		title="marker at {time}"
		class="tl-block-marker-indicator"
		class:at-playhead={$playheadTime == absoluteTime}
	>
		<div class="tick"></div>
		<div class="spacer flex-grow"></div>
		<div class="tick"></div>
	</div>
</svelte:element>

<style lang="postcss">
	.tl-block-marker-wrapper {
		@apply absolute h-full;
	}

	.tl-block-marker-interactive {
		margin-left: -50%;
		@apply relative w-4 h-full flex items-center justify-center pointer-events-auto z-20 cursor-default;
	}

	.tl-block-marker-indicator {
		margin-left: -0.0625rem;
		width: 0.0625rem;
		bottom: 0.0625rem;
		top: 0.0625rem;
		@apply flex flex-col absolute pointer-events-none z-0 cursor-default;
	}

	.tick {
		@apply bg-gray-800 dark:bg-gray-100 bg-opacity-50 dark:bg-opacity-50 h-1;
	}

	.at-playhead {
		margin-left: -0.125rem;
		width: 0.125rem;
	}

	.at-playhead .tick,
	.at-playhead .spacer {
		@apply bg-red-800 dark:bg-red-400 bg-opacity-100;
	}
</style>
