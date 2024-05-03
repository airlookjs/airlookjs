<script lang="ts">
	import { SequenceBlock, SequenceLayer, type Layer } from '$lib';

	export let data: Layer;
	export let index: number;
</script>

<SequenceLayer {data} {index}>
	<div slot="header" let:nestedLayerCount>
		Layer {index}. with {nestedLayerCount} nested layers
	</div>

	<SequenceBlock slot="block" let:block {block} bgColor="bg-blue-200 dark:bg-blue-900">
		<!-- <svelte:fragment slot="layers" let:layers>
            {#each layers as _layer, i (_layer.key)}
                <svelte:self layer={_layer} index={i} />
            {/each}
        </svelte:fragment>-->

		<!-- Use custom component recursively -->
		<svelte:self data={layer} {index} slot="layer" let:layer let:index />
	</SequenceBlock>
</SequenceLayer>
