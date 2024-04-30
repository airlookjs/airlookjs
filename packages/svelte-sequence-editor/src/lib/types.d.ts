import type { Writable } from 'svelte/store';
import { Sequence } from './Sequence';
import { Layer } from './Layer';
import { Block } from './Block';

type BlockHandleType = 'inTime' | 'outTime' | 'block'; // TODO: enum

export type TValidationOption = {
	min?: number | { ref: string };
	max?: number | { ref: string };
	fixed?: number | { ref: string };
};

export type TValidationOptions = {
	duration?: TValidationOption;
	inTime?: TValidationOption;
	outTime?: TValidationOption;
};

export type TSequenceOptions = {
	validations?: TValidationOptions;
	roundingBase: () => number;
	errorHandler?: (error: { type: string; message: string }) => void;
};

export interface ISequenceCommonOptions {
	key: string;
	title?: string;
	data?: {
		// any additional data
		[key: string]: unknown;
	};
}

export type TSequenceLayerOptions = ISequenceCommonOptions & {
	blocks: Array<TSequenceBlockOptions>;
	sortIndex?: number;
};

export type TSequenceBlockOptions = ISequenceCommonOptions & {
	key: string;
	id?: number;
	layer?: number;
	title?: string;
	inTime?: number; // Initial inTime absolute as absolute milliseconds
	outTime?: number; // Initial outTime as absolute milliseconds
	validations?: TValidationOptions;
	layers?: Array<TSequenceLayerOptions>;
};

export interface ISequenceCommon {
	initialize(): void;
	scale(scaleFactor: number): void;
	update(): void;
	validate(): void; // maybe return errors ?
	getSequence(): Sequence;
	getByKey(absoluteKey: string): ISequenceChild | null;

	errors: { type: string; message: string }[];
	layers?: Layer[];
	blocks?: Block[];

	data?: {
		[key: string]: unknown;
	};

	getMaxDuration?(): number;
}
export interface ISequenceChild extends ISequenceCommon {
	parent: ISequenceCommon;
	getAbsoluteKey(): string;
}

export type TSequenceChild = Layer | Block;

export type TSequenceData = Layer[];

export type TSelectedHandle = Writable<null | {
	//layer: undefined | number;
	block: Block;
	cursor: string;
	handle: BlockHandleType;
}>;

export interface SequenceContext {
	time: Writable<number>;
	width: Writable<number>;
	duration: Writable<number>;
	selectedHandle: TSelectedHandle;
	scrubOverride: Writable<boolean>;
	sequence: Writable<Sequence>;
	setTime: (value: number) => void;
}
