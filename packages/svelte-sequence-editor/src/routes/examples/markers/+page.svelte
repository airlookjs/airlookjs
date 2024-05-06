<script lang="ts">
	import { Sequence, SequenceTimebar } from '$lib';
	import { createSequence } from '$lib/createSequence';
	import { writable } from 'svelte/store';
	import CustomLayer from './CustomLayer.svelte';
	import { Label, Input, Button, Modal } from 'flowbite-svelte';

	import dayjs from 'dayjs';
	import dayjsDuration from 'dayjs/plugin/duration';
	dayjs.extend(dayjsDuration);

	let modal = false;

	const PromoterBlockTemplate = {
		key: 'promoter',
		type: 'promoter',

		validations: {
			duration: {
				min: 2000
			}
		}
	};

	// Template for 4 sales
	const template = {
		layers: [
			{
				key: 'video',
				sortIndex: 2,
				blocks: [
					// defaultblocks
					{
						key: 'footage',
						title: 'footage with scene markers',
						inTime: 0,
						outTime: 10000,
						markers: [
							{
								time: 1000,
								title: 'scene 1'
							},
							{
								time: 1050,
								title: 'scene 2'
							},
							{
								time: 300
							},
							{
								time: 4000
							},
							{
								time: 5000
							},
							{
								time: 6000,
								title: 'scene 6'
							},
							{
								time: 7000,
								title: 'scene 7'
							},
							{
								time: 8000,
								title: 'scene 8'
							},
							{
								time: 9000,
								title: 'scene 9'
							},
							{
								time: 10000,
								title: 'scene 10'
							}
						]
					}
				]
			},
			{
				key: 'promoters',
				blocks: [
					// defaultblocks
					{
						...PromoterBlockTemplate,
						key: 'title',
						layers: [
							{
								key: 'layer1',
								blocks: [
									// defaultblocks
									{
										key: 'block1',
										validations: {
											inTime: {
												fixed: 0
											}
										}
									},
									{
										key: 'block2',
										layers: [
											{
												key: 'layer1',
												blocks: [
													// defaultblocks
													{
														key: 'block1'
													},
													{
														key: 'block2'
													}
												]
											},
											{
												key: 'layer2',
												blocks: [
													// defaultblocks
													{
														key: 'block1'
													},
													{
														key: 'block2'
													}
												]
											}
										]
									}
								]
							}
						]
					}
				]
			}
		]
	};

	// Data from database is flat
	const look = {
		duration: 20000,
		components: [
			{
				type: 'media',
				inTime: 0,
				outTime: 10000
			},
			{
				type: 'promoter',
				inTime: 0,
				outTime: 10000
			},
			{
				type: 'promoter',
				inTime: 1000,
				outTime: 4000
			},
			{
				type: 'promoter',
				inTime: 1000,
				outTime: 4000
			},
			{
				type: 'promoter',
				inTime: 1000,
				outTime: 4000
			}
		]
	};

	let time = writable(0);

	const sequence = createSequence({
		initialData: template.layers,
		duration: look.duration
	});

	const { options, duration, getBlockStore } = sequence;

	$: footageblock = getBlockStore('video.footage')!;

	const videoInChangeHandler = (e: Event) => {
		$footageblock.absoluteInTime = (e.target as HTMLInputElement).valueAsNumber;
	};

	const durationChangeHandler = (e: Event) => {
		$duration = (e.target as HTMLInputElement).valueAsNumber;
	};

	/*
	TODO: toggle snapping
	*/

	const millisInSecond = 1000;
	const millisInFrame = (framerate: number) => {
		return (1 / framerate) * millisInSecond;
	};

	type formatTimeOptions = {
		framerate?: number;
		format?: string;
	};
	const formatTimeFn = (time: number, options?: formatTimeOptions) => {
		if (time === undefined || time === null) {
			return '';
		}

		time = Math.floor(time);

		let format = options?.format ?? 'HH:mm:ss.SSS';
		const framerate = options?.framerate ?? 25;

		const duration = dayjs.duration(time, 'milliseconds');

		if (format.includes('FF')) {
			// calculate remaining frames after smallest unit in format string

			const millis = duration.milliseconds();
			const frames = Math.floor(millis / millisInFrame(framerate));

			format = format.replace('FF', `${frames}`.padStart(2, '0'));
		}

		if (format.includes('R')) {
			format = format.replace('R', `${framerate}`);
		}

		return `${duration.format(format)}`;
	};
</script>

<section class="pb-6">
	<h2 class="text-2xl mb-6">Example with markers and custom styling</h2>

	<h3 class="mb-4 text-lg">Bind data from a form to the sequence editor</h3>

	<Button on:click={() => (modal = true)}>modal, z-index test</Button>

	<div class="mb-4">
		<Label for="duration">Duration</Label>
		<Input
			name="duration"
			id="duration"
			type="number"
			value={$duration}
			on:change={durationChangeHandler}
		/>
	</div>

	<div class="mb-4">
		<Label for="videoin">Video in</Label>
		<Input
			type="number"
			id="videoin"
			value={$footageblock.absoluteInTime}
			on:change={videoInChangeHandler}
		/>
	</div>

	<div class="mb-6">
		<h3 class="mb-2 text-lg">Default rendering</h3>
		<Sequence {options} {duration} {sequence} />
	</div>

	<div class="mb-6 relative">
		<h3 class="mb-2 text-lg">Custom rendering</h3>
		<Sequence
			{sequence}
			bind:currentTime={$time}
			{formatTimeFn}
			class="mb-4 w-full dark:border-gray-700 dark:bg-gray-800"
		>
			<SequenceTimebar slot="timebar" class="dark:bg-gray-900" />

			<svelte:fragment slot="layer" let:layer let:index>
				<CustomLayer data={layer} {index} />
			</svelte:fragment>
		</Sequence>
	</div>
</section>

<Modal title="Terms of Service" bind:open={modal} autoclose>
	<p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
		Should render on top of timeline
	</p>
</Modal>
