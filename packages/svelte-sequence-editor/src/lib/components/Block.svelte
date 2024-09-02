<!-- @component `SequenceBlock` must be descendent of `SequenceLayer`. -->

<script context="module" lang="ts">
</script>

<script lang="ts">
	import { uniqueClasses } from '../utils';
	import { fade } from 'svelte/transition';
	import { getSequenceContext } from './SequenceContext';

	import Layer from '../components/Layer.svelte';
	import BlockHandle from '../components/BlockHandle.svelte';
	import BlockMarker from '../components/BlockMarker.svelte';

	import type { Block } from '../Sequence';

	const { duration, width, selectedHandle, sequence, time, scrubOverride, snapTimes } =
		getSequenceContext();

	export let block: Block;
	export let markers = block.markers ?? [];

	let blockEl: HTMLElement | null;

	let snap = true;

	$: anyFixed =
		typeof block.validations?.inTime?.fixed == 'number' ||
		typeof block.validations?.outTime?.fixed == 'number';

	const selectBlockHandle = (e: PointerEvent) => {
		e.preventDefault();
		if (noHandles || anyFixed) return;

		$snapTimes = [];
		snap = true;
		scrubOverride.set(true);

		selectedHandle.set({
			//layer: block.get,
			block: block,
			handle: 'block',
			cursor: disabled ? 'cursor: not-allowed' : 'grabbing'
		});

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

			// if user has cursor over a marker or handle on another block then snap to its time if within a certain threshold
			let res;
			const snapThreshold = 10 * ($duration / $width); // snap to marker if within 10 pixels regardless of screen width and duration

			const opts = { snap, snapTimes: $snapTimes, snapThreshold };

			if (handle == 'block') {
				res = block.move(accDeltaTime, opts);
				time.set(block.absoluteInTime);
			} else if (handle == 'inTime') {
				/*const snapInDelta = $snapValue && $snapValue - (block.inTime + accDeltaTime);
				if(snapInDelta && Math.abs(snapInDelta) < snapThreshold) {
					console.log("snap to marker for in")
					//accDeltaTime-=snapInDelta;
					res = block.setInTime($snapValue!, { snap: snap });
					// set snap state
					snapBlockStartTime = new Date().getTime();
					snapBlockState = true;
					accDeltaTime = 0;
					//snap = true;
				} else {*/

				res = block.setInTime(block.inTime + accDeltaTime, opts);
				//}

				time.set(block.absoluteInTime);
			} else if (handle == 'outTime') {
				res = block.setOutTime(block.outTime + accDeltaTime, opts);
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

	//const timeToPixel = (t: number) => (t / $duration) * $width;
	//$: console.log(accDeltaTime);
	export let tag = 'div';
	export let noHandles = false;
	export let disabled = false;
	export let containerClasses = 'tl-block-container';
	let className = '';
	export { className as class };
	let moveable = true; // !(block.validations?.inTime?.fixed || block.validations?.outTime?.fixed);

	$: cursorStyle = $selectedHandle
		? ''
		: disabled
			? 'cursor: not-allowed'
			: moveable && !noHandles && !anyFixed
				? 'cursor: grab'
				: 'cursor: default';

	export let bgColor = `bg-amber-200 dark:bg-amber-900`;

	// should this also be cursor ew-resize?

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
	$: offsetLeft = blockEl?.offsetLeft ?? 0;
	$: title = block.title ?? block.key;

	//$: console.log($snapTimes);
	// TODO: replace all div with svelte:element to allow for svg rendering
</script>

<svelte:window
	on:pointerup={releaseHandle}
	on:pointermove={handlePointerMove}
	on:keydown={handleKeyDown}
	on:keyup={handleKeyUp}
/>

<!-- todo add aria stuff and remove next line-->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<svelte:element
	this={tag}
	class={uniqueClasses(`${containerClasses}${className ? ` ${className}` : ''}`)}
	style="width: 0;"
	bind:this={blockEl}
	transition:fade
	{...$$restProps}
>
	<slot {noHandles} {disabled} {blockLeft} {blockRight} {blockWidth} {block}>
		<div
			on:mouseenter={() => {
				if ($selectedHandle && $selectedHandle.block.getAbsoluteKey() != block.getAbsoluteKey()) {
					// unique and sorted snaptimes
					$snapTimes = [
						...$snapTimes,
						block.absoluteInTime,
						block.absoluteOutTime,
						...markers.map((m) => m.time + block.absoluteInTime)
					]
						.sort((a, b) => a - b)
						.filter((v, i, a) => a.indexOf(v) === i);
				}
			}}
			class="tl-block relative"
			style="margin-left: {blockLeft - offsetLeft}px; width: {blockWidth}px;"
		>
			<div
				class="tl-block-main {bgColor} {handle
					? `tl-selected tl-active-handle-${handle.toLowerCase()}`
					: ''}"
			>
				<slot {markers} name="markers">
					{#if markers.length > 0}
						<div class="tl-block-markers">
							{#each markers as marker, index}
								<BlockMarker
									time={marker.time}
									title={marker.title}
									{index}
									disableSnapping={handle != null}
									{block}
								></BlockMarker>
							{/each}
						</div>
					{/if}
				</slot>

				<div class="tl-block-left">
					<slot {noHandles} {disabled} name="inHandle">
						{#if !noHandles}
							<BlockHandle
								type="inTime"
								{disabled}
								{block}
								selected={handle}
								on:selectHandle={() => {
									snap = true;
								}}
							/>
						{/if}
					</slot>
				</div>
				<div class="tl-block-content" style="{cursorStyle};" on:pointerdown={selectBlockHandle}>
					<slot {noHandles} {disabled} {block} name="content">
						<span class="inner">{title}</span>
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
								{block}
								on:selectHandle={() => {
									snap = true;
								}}
							/>
						{/if}
					</slot>
				</div>
			</div>

			{#if block.layers.length > 0}
				<div class="tl-block-children">
					<slot layers={block.layers} name="layers">
						{#each block.layers as layer, index (layer.key)}
							<slot {layer} {index} name="layer">
								<!-- default sublayer rendering -->
								<Layer {disabled} data={layer} {index} class="" />
							</slot>
						{/each}
					</slot>
				</div>
			{/if}
		</div>
	</slot>
</svelte:element>

<style lang="postcss">
	.tl-block {
		@apply h-full;
	}

	.tl-block-main {
		@apply flex items-stretch border border-gray-100 dark:border-gray-800 rounded-sm shadow-sm;
	}
	.tl-block .tl-selected {
		@apply shadow;
	}

	.tl-block-left,
	.tl-block-right {
		@apply flex-none z-40;
	}

	.tl-block-content {
		@apply flex-1 overflow-hidden ml-1 p-0.5 z-10;
	}

	.tl-block-markers {
		@apply absolute top-0 w-full overflow-hidden bottom-0 pointer-events-none;
	}
</style>
