<script lang="ts">
	import { Sequence } from '$lib';

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
				key: 'speak',
				blocks: [
					// defaultblocks
					{
						key: 'audio',
						inTime: 0,
						outTime: 10000
					}
				]
			},
			{
				key: 'video',
				blocks: [
					// defaultblocks
					{
						key: 'footage',
						title: 'very long footage title to make this block largerrrr',
						inTime: 0,
						outTime: 10000
					}
				]
			},
			{
				key: 'promoters',
				blocks: [
					// defaultblocks
					{
						...PromoterBlockTemplate,
						key: 'promoter1',
						layers: [
							{
								key: 'layer1',
								blocks: [
									// defaultblocks
									{
										key: 'block1'
									},
									{
										key: 'block2 lorem ipsum dolor sit amet asdjgfnæojrgo ojdsfog hosdfhg sdfogj ofdg',
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
					},
					{
						...PromoterBlockTemplate,
						key: 'promoter2',
						title: 'very long title for this block'
					},
					{
						...PromoterBlockTemplate,
						key: 'promoter3'
					},
					{
						...PromoterBlockTemplate,
						key: 'promoter4'
					}
				]
			},
			{
				key: 'video2',
				blocks: [
					{
						key: 'block'
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

	import { createSequence } from '$lib/createSequence';

	const sequence = createSequence({
		initialData: template.layers,
		duration: look.duration
	});

	const { options, duration, getBlockStore } = sequence;

	let sequenceComponent;

	/*const newLook = {
		duration: $duration,
		components: [
			{
				type: 'media',
				inTime: 0,
				outTime: 10000
			}
		]
	};*/

	//		<number input="number" name="videoin" bind:value={sequence.getBlockByKey('video.footage')} />

	$: footageblock = getBlockStore('video.footage')!;

	const videoInChangeHandler = (e: Event) => {
		$footageblock.absoluteInTime = (e.target as HTMLInputElement).valueAsNumber;
	};

	const durationChangeHandler = (e: Event) => {
		$duration = (e.target as HTMLInputElement).valueAsNumber;
	};
</script>

<section class="pb-6">
	<h2 class="text-2xl">Example</h2>

	<h3>Bind data from a form to the sequence editor</h3>

	<label for="duration">Duration</label>
	<input
		name="duration"
		id="duration"
		type="number"
		value={$duration}
		on:change={durationChangeHandler}
	/>

	<input
		type="number"
		name="videoin"
		value={$footageblock.absoluteInTime}
		on:change={videoInChangeHandler}
	/>

	<Sequence {options} {duration} {sequence} bind:this={sequenceComponent} />
</section>
