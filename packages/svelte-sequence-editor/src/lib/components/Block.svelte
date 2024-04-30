<script context="module" lang="ts">
</script>

<script lang="ts">
	import { getContext } from 'svelte';
	import { uniqueClasses } from '../utils';
	import { fade } from 'svelte/transition';
	import { key } from './key';
	import Layer from '../components/Layer.svelte';
	import BlockHandle from '../components/BlockHandle.svelte';

	import type { Block } from '../Block';
	import type { SequenceContext } from '../shared';

	const { duration, width, selectedHandle, sequence, time, scrubOverride }: SequenceContext =
		getContext(key);

	export let block: Block;

	let blockEl: HTMLElement | null;
	type BlockHandleType = 'inTime' | 'outTime' | 'block';

	const selectHandle = (type: BlockHandleType) => {
		snap = true;
		scrubOverride.set(true);

		selectedHandle.set({
			//layer: block.get,
			block: block,
			handle: type,
			cursor: disabled ? 'cursor: not-allowed' : type == 'block' ? 'grabbing' : 'ew-resize'
		});
	};
	const selectInHandle = (e: PointerEvent) => {
		e.preventDefault();
		selectHandle('inTime');
		time.set(block.absoluteInTime);
	};

	const selectOutHandle = (e: PointerEvent) => {
		e.preventDefault();
		selectHandle('outTime');
		time.set(block.absoluteOutTime);
	};
	const selectBlockHandle = (e: PointerEvent) => {
		e.preventDefault();
		if (noHandles) return;
		selectHandle('block');
		time.set(block.absoluteInTime);
	};

	let precisionModifier = false;
	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key == 'Alt') precisionModifier = true;
	};
	const handleKeyUp = (e: KeyboardEvent) => {
		if (e.key == 'Alt') {
			precisionModifier = false;
		} else if (handle) {
			if (e.key == 'j') {
				// Move handle left
				// TODO: First we need to allow a handle being selected when not being dragged
				// Move it in increments of roundingBase()
			} else if (e.key == 'k') {
				// Move handle right
			}
		}
	};

	let snapBlockState = false;
	let snapBlockStartTime = 0;
	const snapOffAfterMillis = 500;
	let snap = true;
	let lastDeltaTime = 0;

	let accDeltaTime = 0;
	const handlePointerMove = (e: PointerEvent) => {
		if (handle) {
			let deltaTime = (e.movementX / $width) * $duration;

			//if(snapBlockState ) {
			//}
			//console.log($width)
			if (disabled) {
				console.log('disabled');
				return;
			}

			if (precisionModifier) {
				accDeltaTime += deltaTime * (($width / $duration) * 2);
			} else {
				accDeltaTime += deltaTime;
			}

			if (deltaTime == 0) {
				return;
			}

			//console.log(deltaTime)
			if ((deltaTime < 0 && lastDeltaTime > 0) || (deltaTime > 0 && lastDeltaTime < 0)) {
				//console.log("change direction")
				snapBlockState = false;
				snap = true;
			}
			lastDeltaTime = deltaTime;

			if (
				snap &&
				snapBlockState &&
				new Date().getTime() - snapBlockStartTime > snapOffAfterMillis
			) {
				snap = false;
				accDeltaTime = deltaTime;
				//console.log("snap off")
			}

			let res;

			if (handle == 'block') {
				res = block.move(accDeltaTime, { snap: snap });
				time.set(block.absoluteInTime);
			} else if (handle == 'inTime') {
				res = block.setInTime(block.inTime + accDeltaTime, { snap: snap });
				time.set(block.absoluteInTime);
			} else if (handle == 'outTime') {
				res = block.setOutTime(block.outTime + accDeltaTime, { snap: snap });
				time.set(block.absoluteOutTime);
			}

			if (!snapBlockState && res?.blocked) {
				snapBlockStartTime = new Date().getTime();
				snapBlockState = true;
				accDeltaTime = 0;
				//console.log('snap on');
			} else {
				if (res && res.moved != 0) {
					accDeltaTime -= res.moved;
				}

				sequence.set($sequence);
				selectedHandle.update((val) => {
					if (val) val.block = block;
					return val;
				});
			}
		}
	};
	const releaseHandle = () => {
		accDeltaTime = 0;
		if (handle) {
			snapBlockState = false;
			scrubOverride.set(false);
		}
	};

	export let tag = 'div';
	export let noHandles = false;
	export let disabled = false;
	export let containerClasses = 'tl-block-container';
	let className = '';
	export { className as class };
	let moveable = true; // !(block.validations?.inTime?.fixed || block.validations?.outTime?.fixed);
	$: cursorClass = disabled
		? 'cursor: not-allowed'
		: moveable && !noHandles
		  ? 'cursor: grab'
		  : 'cursor: default';
	const bgColor = 'bg-amber-200';

	let blockLeft: number, blockRight: number, blockWidth: number;
	$: {
		blockLeft = (block.inTime / $duration) * $width;
		blockRight = $width - (block.outTime / $duration) * $width;
		blockWidth = $width - (blockRight + blockLeft);
	}
	$: handle =
		$selectedHandle?.block.getAbsoluteKey() == block.getAbsoluteKey()
			? $selectedHandle?.handle
			: null;
	$: offsetLeft = blockEl?.offsetLeft || 0;
	$: title = block.title || block.key;
</script>

<svelte:window
	on:pointerup={releaseHandle}
	on:pointermove={handlePointerMove}
	on:keydown={handleKeyDown}
	on:keyup={handleKeyUp}
/>

<svelte:element
	this={tag}
	class={uniqueClasses(`${containerClasses}${className ? ` ${className}` : ''}`)}
	style="width: 0;"
	bind:this={blockEl}
	transition:fade
	{...$$restProps}
>
	<slot {noHandles} {disabled} {blockLeft} {blockRight} {blockWidth} {block}>
		<div class="tl-block" style="margin-left: {blockLeft - offsetLeft}px; width: {blockWidth}px;">
			<div
				class="tl-block-main {bgColor} {handle
					? `tl-selected tl-active-handle-${handle.toLowerCase()}`
					: ''}"
			>
				<div class="tl-block-left">
					<slot {noHandles} {disabled} name="inHandle">
						{#if !noHandles}
							<BlockHandle
								type="inTime"
								{disabled}
								selected={handle}
								fixed={typeof block.validations?.inTime?.fixed == 'number'}
								on:pointerdown={selectInHandle}
								on:mouseover={() => {
									if (handle) return;
									scrubOverride.set(true);
									time.set(block.absoluteInTime);
								}}
								on:mouseleave={() => {
									if (handle) return;
									scrubOverride.set(false);
								}}
							/>
						{/if}
					</slot>
				</div>
				<div
					class="tl-block-content {bgColor}"
					style="{cursorClass};"
					on:pointerdown={selectBlockHandle}
				>
					<slot {noHandles} {disabled} {block} name="content">
						{title}
						{#if block.errors.length > 0}
							<div class="text-red-500">
								{#each block.errors as error}
									{error}
								{/each}
							</div>
						{/if}
					</slot>
				</div>

				<div class="tl-block-right">
					<slot {noHandles} {disabled} name="outHandle">
						{#if !noHandles}
							<BlockHandle
								type="outTime"
								selected={handle}
								{disabled}
								fixed={typeof block.validations?.outTime?.fixed == 'number'}
								on:pointerdown={selectOutHandle}
								on:mouseover={() => {
									if (handle) return;
									scrubOverride.set(true);
									time.set(block.absoluteOutTime);
								}}
								on:mouseleave={() => {
									if (handle) return;
									scrubOverride.set(false);
								}}
							/>
						{/if}
					</slot>
				</div>
			</div>

			{#if block.layers.length > 0}
				<div class="tl-block-children">
					<slot layers={block.layers} name="sublayers">
						{#each block.layers as subLayer (subLayer.key)}
							<Layer {disabled} data={subLayer} class="" />
						{/each}
					</slot>
				</div>
			{/if}
		</div>
	</slot>
</svelte:element>

<style lang="postcss">
	@tailwind base;
	@tailwind components;
	@tailwind utilities;

	.tl-block {
		@apply h-full;
	}

	.tl-block-main {
		@apply flex items-stretch border rounded-sm shadow-sm;
	}

	.tl-block .tl-selected {
		@apply shadow;
	}

	.tl-block-left,
	.tl-block-right {
		@apply flex-none;
	}

	.tl-block-content {
		@apply flex-1 overflow-hidden ml-1 p-0.5;
	}
</style>
