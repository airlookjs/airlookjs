export { default as Sequence } from './components/Sequence.svelte';
export { default as SequenceTimebar } from './components/Timebar.svelte';
export { default as SequenceLayer } from './components/Layer.svelte';
export { default as SequenceBlock } from './components/Block.svelte';
export { default as SequenceBlockHandle } from './components/BlockHandle.svelte';
export { createSequence, deepFlat } from './createSequence';

export { Block } from './Sequence';
export { Layer } from './Sequence';

export type { TSequenceOptions, TSequenceLayerOptions, ISequenceCommonOptions } from './types';
