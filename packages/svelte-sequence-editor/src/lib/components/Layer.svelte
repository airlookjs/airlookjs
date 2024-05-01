<!-- @component `SequenceLayer` must be descendent of `Sequence`. -->

<script context="module" lang="ts">
</script>

<script lang="ts">
	import SequenceBlock from '../components/Block.svelte';
	//import { flip } from 'svelte/animate';
	//import type { FlipParams } from 'svelte/animate';
	import { getSequenceContext } from './SequenceContext';
	import { afterUpdate } from 'svelte';
	import { uniqueClasses } from '../utils';
	import { fade } from 'svelte/transition';
	import type { Layer } from '../Layer';
	import type { Block } from '../Block';

	//export let animate: FlipParams = {};
	const { width, duration } = getSequenceContext();
	let layerEl: HTMLElement | null;

	export let data: Layer;
	export let index: number;

	export let disabled = false;

	$: layer = data;
	$: inTime = layer.getInTime();
	$: outTime = layer.getOutTime();

	//$: layers.set([...$layers])
	$: blocks = layer.blocks ?? [];
	//eslint-disable-next-line @typescript-eslint/no-empty-function
	afterUpdate(async () => {});

	export let tag = 'div';
	export let containerClasses = `tl-layer-container`;
	let className = '';
	export { className as class };

	let layerLeft: number, layerRight: number, layerWidth: number;
	$: {
		layerLeft = (inTime / $duration) * $width;
		layerRight = $width - (outTime / $duration) * $width;
		layerWidth = $width - (layerRight + layerLeft);
	}

	// get height of layer, increment of the nestedLayerCount number of child layers
	//$: height =
	// get nestedLayerCount number of layers in blocks recursively

	//let height = 40;
	let nestedLayerCount = 0;
	$: {
		let _nestedLayerCount = 0;
		const recurse = (blocks: Block[]) => {
			blocks.forEach((block) => {
				if (block.layers) {
					block.layers.forEach((_layer) => {
						if (_layer.blocks) {
							_nestedLayerCount += 1;
							recurse(_layer.blocks);
						}
					});
				}
			});
		};
		recurse(blocks);
		nestedLayerCount = _nestedLayerCount;
		//height = (nestedLayerCount + 1) * 30;
		//console.log("nestedLayerCount", nestedLayerCount)
	}

	/*
			<div
			class="relative"
			style="height:{height}px;"
		>

	**/

	export let title: string | undefined = undefined;

	$: depth = (layer.getAbsoluteKey().split('.').length + 1) / 2;
</script>

<svelte:element
	this={tag}
	style:width={$width}
	bind:this={layerEl}
	class={uniqueClasses(`${containerClasses}${className ? ` ${className}` : ''}`)}
	transition:fade
	{...$$restProps}
>
	<slot {blocks} {layer} {layerLeft} {layerRight} {layerWidth} {nestedLayerCount}>
		<slot name="header" {nestedLayerCount}>
			{#if title}
				<div class="">
					<h2 class="">{title}</h2>
				</div>
			{/if}
		</slot>
		<!--<div class="absolute" style="left: {layerLeft}px; right: {layerRight}px;">
    	</div>-->
		<div
			class="tl-layer tl-depth-{depth} {depth % 2 == 0 ? 'tl-depth-even' : 'tl-depth-odd'} {index %
				2 ==
			0
				? 'tl-index-even'
				: 'tl-index-odd'} tl-index-{index}"
		>
			{#if blocks?.length > 0}
				<slot name="blocks">
					{#each blocks as block (block.key)}
						<slot {block} name="block">
							<SequenceBlock {disabled} {block}>
								<svelte:self data={layer} {index} slot="layer" let:layer let:index class="" />
							</SequenceBlock>
						</slot>
					{/each}
				</slot>
			{:else}
				<slot name="empty">
					<em>empty layer</em>
				</slot>
			{/if}
		</div>
	</slot>
</svelte:element>

<style lang="postcss">
	.tl-layer-container {
		@apply block relative;
	}

	.tl-layer {
		@apply flex items-stretch border-r border-l rounded-lg border-dashed border-gray-300 dark:border-gray-600 shadow-inner;
	}

	.tl-layer.tl-depth-1 {
		@apply border-b;
	}

	/*:global(.tl-layer-container:nth-child(odd)) .tl-layer {
		@apply bg-gray-100 bg-opacity-50;
	}*/

	.tl-index-odd {
		@apply bg-gray-100 dark:bg-gray-800 bg-opacity-50 dark:bg-opacity-50;
	}

	.tl-index-even {
		@apply bg-gray-50 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-50;
	}

	.tl-layer.tl-depth-1.tl-index-0 {
		@apply border-t;
	}
</style>
