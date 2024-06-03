import type { Sequence } from '$lib/Sequence';
import type { TSelectedHandle } from '$lib/types';
import type { Writable } from 'svelte/store';

import { getContext, setContext } from 'svelte';
export interface SequenceContext {
	time: Writable<number>;
	width: Writable<number>;
	duration: Writable<number>;
	selectedHandle: TSelectedHandle;
	snapTimes: Writable<number[]>;
	scrubOverride: Writable<boolean>;
	sequence: Writable<Sequence>;
	formatTimeFn: (time: number) => string;
};

export const key = Symbol();

export const setSequenceContext = (context: SequenceContext) : SequenceContext => {
	return setContext<SequenceContext>(key, context);
};

export const getSequenceContext = () : SequenceContext => {
	return getContext<SequenceContext>(key);
};
