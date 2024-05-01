<script lang="ts">
	import { Sequence, SequenceLayer, SequenceTimebar, SequenceBlock, createSequence } from '$lib';
	import { sampleData2 } from '../data';

	const sequence = createSequence({
		duration: sampleData2.duration,
		initialData: sampleData2.layers
	});

	const { options, duration } = sequence;
</script>

<section class="pb-6">
	<h2 class="text-2xl">Example custom SVG rendering</h2>
	<Sequence tag="svg" width="100%" height="100%" {sequence} {options} {duration} let:layers>
		{#if layers}
			{#each layers as layer, index (layer.key)}
				<SequenceLayer tag="g" {index} data={layer}>
					<text slot="header">
						custom header for {layer.key}
					</text>

					<SequenceBlock {block} let:block slot="block" tag="g">
						<rect height="100%" width="10%" fill={'#333'} />
						<text>Custom block</text>
					</SequenceBlock>
				</SequenceLayer>
			{/each}
		{/if}
		<SequenceTimebar />
	</Sequence>
</section>
