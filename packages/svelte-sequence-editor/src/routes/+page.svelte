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
				outTime: 10000,
				_TLKey: 'video.footage'
			},
			{
				type: 'promoter',
				inTime: 0,
				outTime: 10000,
				_TLKey: 'promoters.promoter1'
			},
			{
				type: 'promoter',
				inTime: 1000,
				outTime: 4000,
				_TLKey: 'promoters.promoter2'
			},
			{
				type: 'promoter',
				inTime: 1000,
				outTime: 4000,
				_TLKey: 'promoters.promoter3'
			},
			{
				type: 'promoter',
				inTime: 1000,
				outTime: 4000,
				_TLKey: 'promoters.promoter4'
			}
		]
	};

	import { createSequence } from '$lib';

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
</script>

<header class="p-6">
	<h1 class="text-4xl">Svelte Sequence Editor</h1>
</header>

<main class="p-6">
	<section class="pb-6">
		<h2 class="text-2xl">Getting started</h2>
		<pre>npm install @airlookjs/svelte-sequence-editor</pre>
	</section>

	<section class="pb-6">
		<h2 class="text-2xl">Example</h2>

		<h3>Bind data from a form to the sequence editor</h3>

		<label for="duration">Duration</label>
		<input
			name="duration"
			id="duration"
			type="number"
			value={$duration}
			on:change={(e) => {
				$duration = e.target.value;
			}}
		/>

		<input
			type="number"
			name="videoin"
			value={$footageblock.absoluteInTime}
			on:change={(e) => {
				$footageblock.absoluteInTime = e.target.value;
			}}
		/>

		<Sequence {options} {duration} {sequence} bind:this={sequenceComponent} />
	</section>
</main>
