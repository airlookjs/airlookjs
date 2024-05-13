import { writable, derived, type Updater, type Writable } from 'svelte/store';
import { Layer } from './Layer';
import type { TSequenceLayerOptions, TSequenceOptions, TSequenceChild } from './types';
import { Sequence } from './Sequence';
import type { Block } from './Block';

const DEFAULT_DURATION = 30000;
const DEFAULT_OPTIONS: Required<TSequenceOptions> = {
	validations: {
		inTime: {},
		outTime: {},
		duration: {
			min: 3000
		}
	},
	roundingBase: () => {
		return 1;
	},
	errorHandler: (error) => {
		console.error(error);
	}
};

export const deepFlat = (data: TSequenceChild[]) : TSequenceChild[] => {
	return data.reduce<TSequenceChild[]>((acc, item) => {
		acc.push(item);
		const children = item instanceof Layer ? item.blocks : item.layers;
		if (children && children.length > 0) {
			acc = acc.concat(deepFlat(children));
		}
		return acc;
	}, []);
};

export const createSequence = ({
	initialData,
	duration,
	options
}: {
	initialData: TSequenceLayerOptions[];
	duration?: number; // | Writable<number>
	options?: TSequenceOptions;
// TODO: return type
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
}) => {
	options = {
		...DEFAULT_OPTIONS,
		...options
	};

	duration = duration ?? DEFAULT_DURATION;

	const optionsStore = writable(options);
	const durationStore = writable(duration);

	const sequence = new Sequence(initialData, duration, options);
	sequence.initialize(); // control when its called?

	const sequenceStore = writable(sequence);

	durationStore.subscribe((value) => {
		sequence.setDuration(value);
		durationStore.set(sequence.getDuration());
		sequenceStore.set(sequence);
	});

	const flatKeyStore = derived(sequenceStore, ($store) => {
		const flat = deepFlat($store.layers);
		const map = new Map<string, TSequenceChild>();

		flat.map((item: TSequenceChild) => {
			map.set(item.getAbsoluteKey(), item);
		});

		return map;
	});

	const getStore = <T extends TSequenceChild>(key: string) => {
		const c = sequence.getByKey(key) as T;
		if (!c) {
			//console.warn('no child found for key in sequence', key);
			return;
		}
		const store: Writable<T> = writable(c);

		const set = (value: T) => {
			store.set(value);
			sequenceStore.set(sequence);
		};

		const update = (updater: Updater<T>) => {
			store.update(updater);
			sequenceStore.set(sequence);
		};

		const unsubscribe = flatKeyStore.subscribe((value) => {
			const change = value.get(key) as T;
			if (change) {
				//console.log('flatKeyStore change', key, change);
				store.set(change);
			} else {
				unsubscribe();
			}
		});

		return {
			subscribe: store.subscribe,
			update: update,
			set
		};
	};

	return {
		getBlockStore: getStore as typeof getStore<Block>,
		getLayerStore: getStore as typeof getStore<Layer>,
		flatKeys: flatKeyStore,
		options: optionsStore,
		duration: durationStore,
		sequence: sequenceStore
	};
};
