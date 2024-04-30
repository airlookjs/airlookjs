<script lang="ts">
	import { Sequence, SequenceLayer, SequenceTimebar, SequenceBlock, createSequence } from '$lib';
	import { sampleData2 } from '../data';

	const sequence = createSequence({
		initialData: sampleData2.layers,
		duration: sampleData2.duration,
	})

	const { options, duration, getBlockStore } = sequence;

</script>

<section class="pb-6">
	<h2 class="text-2xl">Example custom SVG rendering</h2>
	<Sequence
		{options}
		{duration}
		{sequence}
		tag="svg"
		width="100%"
		height="100%"
		let:layers
	>
		{#if layers}
			{#each layers as layer (layer.key)}
				<SequenceLayer tag="g" data={layer} let:block>
					<text slot="header">
						custom header for {layer.key}
					</text>

					<SequenceBlock {block} tag="g">
						<rect height="100%" width="10%" fill={'#333'} />
						<text>Custom block</text>
					</SequenceBlock>
				</SequenceLayer>
			{/each}
		{/if}
		<SequenceTimebar />
	</Sequence>
</section>
