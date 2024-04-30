<script lang="ts">
	import { uniqueClasses } from '../utils';
	import { getContext } from 'svelte';
	import type { SequenceContext } from '../shared';
	import { key } from './key';

	const { duration, width }: SequenceContext = getContext(key);

	export let formatFn = (value: number) => `${Math.round(value)}`;
	export let time: number;

	let pos: number;
	let textWidth: number;
	let p: number;

	$: {
		p = (time * $width) / $duration;
		const diff = $width - textWidth / 2;

		if (p > diff) {
			pos = diff;
		} else {
			pos = p;
		}

		// Add padding
		pos = Math.max(pos, textWidth / 2 + 4);
		pos = Math.min(pos, diff - 4);
	}

	$: labelString = formatFn(time);

	let containerClasses = 'tl-timebar-label';
	let className = '';
	export { className as class };
</script>

<div class="tl-timebar-indicator" style="position: absolute; left:{p}px;" />

<div
	class={uniqueClasses(`${containerClasses}${className ? ` ${className}` : ''}`)}
	bind:clientWidth={textWidth}
	style="left:{pos - textWidth / 2}px;"
>
	{labelString}
</div>

<style lang="postcss">
	.tl-timebar-label {
		@apply absolute font-semibold font-mono text-center text-white bg-neutral-500 rounded-sm px-1;
	}

	.tl-timebar-indicator {
		@apply border-l border-neutral-500 h-full;
	}
</style>
