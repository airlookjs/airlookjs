import type { Writable } from 'svelte/store';
import type { Sequence, Layer, Block } from './Sequence';

type BlockHandleType = 'inTime' | 'outTime' | 'block'; // TODO: enum

export interface TValidationOption {
	min?: number | { ref: string };
	max?: number | { ref: string };
	fixed?: number | { ref: string };
};

export interface TValidationOptions {
	duration?: TValidationOption;
	inTime?: TValidationOption;
	outTime?: TValidationOption;
};

export interface TSequenceOptions {
	validations?: TValidationOptions;
	roundingBase: () => number;
	errorHandler?: (error: { type: string; message: string }) => void;
};

export interface ISequenceCommonOptions {
	key: string;
	title?: string;
	data?: Record<string, unknown>;
}

export type TSequenceLayerOptions = ISequenceCommonOptions & {
	blocks: TSequenceBlockOptions[];
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
	layers?: TSequenceLayerOptions[];
	markers?: { time: number; title?: string }[];
};

export interface ISequenceCommon {
	initialize(): void;
	scale(scaleFactor: number): void;
	update(): void;
	validate(): void;
	getSequence(): Sequence;
	getByKey(absoluteKey: string): ISequenceChild | null;

	errors: { type: string; message: string }[];
	layers?: Layer[];
	blocks?: Block[];

	data?: Record<string, unknown>;

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
