<script lang="ts">
	import { uniqueClasses } from '../utils';
	import { getSequenceContext } from './SequenceContext';

	const { duration, width, formatTimeFn } = getSequenceContext();

	export let formatFn = formatTimeFn;
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
		@apply absolute font-semibold font-mono text-center px-1 z-50 bg-gray-50 dark:bg-gray-800;
	}

	.tl-timebar-indicator {
		@apply border-l border-red-800 dark:border-red-400 h-full z-40 opacity-50 pointer-events-none;
	}
</style>
