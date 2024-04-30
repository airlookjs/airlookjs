import { Block } from './Block';
import { Sequence } from './Sequence';
import type { ISequenceChild, TSequenceLayerOptions, TSequenceBlockOptions } from './types';

export class Layer implements ISequenceChild {
	parent: Block | Sequence;
	sortIndex: number;
	blocks: Block[] = [];
	key: string;
	//duration?: number;
	title?: string;
	data?: {
		[key: string]: unknown;
	};

	errors: string[] = [];

	constructor(options: TSequenceLayerOptions, parent: Block | Sequence) {
		this.parent = parent;
		this.sortIndex = options.sortIndex ?? -1;
		this.key = options.key ?? `layer-${crypto.randomUUID()}`;
		this.data = options.data;

		//console.log('Layer constructor', options, index);

		this.blocks =
			options.blocks?.map((block, blockIndex) => {
				if (blockIndex > 0) {
					if (!block.inTime) {
						block.inTime = options.blocks[blockIndex - 1].outTime;
					}
				}
				return new Block(block, blockIndex, this);
			}) || [];
	}

	public addBlock(blockOptions: TSequenceBlockOptions, insertAtIndex?: number) {
		const block = new Block(blockOptions, insertAtIndex ?? this.blocks.length, this);

		if (insertAtIndex !== undefined) {
			this.blocks.splice(insertAtIndex, 0, block);

			// Reindex
			this.blocks = this.blocks.map((_block, index) => {
				_block.index = index;
				return _block;
			});
		} else {
			this.blocks.push(block);
		}

		block.initialize();
		return block;
	}

	public removeBlock(key: string) {
		//console.log('removeBlock', key);

		let found = false;
		this.blocks = this.blocks
			.map((block, index) => {
				if (block.getAbsoluteKey() === key) {
					found = true;
					return null;
				}
				if (found) {
					block.index = index - 1;
				}
				return block;
			})
			.filter(Boolean) as Block[];

		//console.log('removed block, now have blocks', this.blocks);

		return this;
	}

	public getAbsoluteKey(): string {
		if (this.parent instanceof Sequence) {
			return this.key;
		}
		return `${this.parent.getAbsoluteKey()}.${this.key}`;
	}

	public update() {
		this.blocks.map((block) => {
			block.update();
		});
	}

	public scale(scaleFactor: number) {
		this.blocks.map((block) => {
			block.scale(scaleFactor);
		});
	}

	public initialize() {
		this.blocks.map((block) => {
			block.initialize();
		});
	}

	public getAbsoluteInTime(): number {
		if (this.parent instanceof Block) {
			return this.parent.absoluteInTime;
		}
		return 0;
	}

	public getAbsoluteOutTime(): number {
		if (this.parent instanceof Sequence) {
			return this.parent.duration;
		}

		// If its not the root its always a block
		return this.parent.absoluteOutTime;
	}

	public getInTime(): number {
		if (this.parent instanceof Block) {
			return this.parent.inTime;
		}
		return 0;
	}

	public getOutTime(): number {
		if (this.parent instanceof Sequence) {
			return this.parent.duration;
		}

		// If its not the root its always a block
		return this.parent.outTime;
	}

	public getDuration() {
		return this.getOutTime() - this.getInTime();
	}

	public getMinDuration() {
		return this.blocks.reduce((acc, b) => {
			return acc + b.getMinDuration();
		}, 0);
	}

	public getSequence(): Sequence {
		return this.parent.getSequence();
	}

	public validate() {
		return this.blocks.map((block) => {
			return block.validate();
		});
	}

	public getByKey(absKey: string): ISequenceChild | null {
		const parts = absKey.split('.');
		const block = this.blocks.find((block) => block.key === parts[0]);
		if (block) {
			if (parts.length === 1) {
				return block;
			}
			return block.getByKey(parts.slice(1).join('.'));
		}
		return null;
	}
}
