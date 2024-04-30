# Svelte Sequence Editor

UI widget and logic for editing timed sequences in recursively nested structures of layers and blocks. Aimed at simple video and media editing in the browser.

[![NPM Version](https://img.shields.io/npm/v/@airlookjs/svelte-sequence-editor.svg?style=flat-square&colorB=51C838)](https://www.npmjs.com/package/@airlookjs/svelte-sequence-editor)

[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

[![CI](https://github.com/airlookjs/svelte-sequence-editor/actions/workflows/ci.yml/badge.svg)](https://github.com/airlookjs/svelte-sequence-editor/actions/workflows/ci.yml)

## Installation

```bash
$ npm install @airlookjs/svelte-sequence-editor
```

## Usage

```typescript
import { createSequence, Sequence } from '@airlookjs/svelte-sequence-editor';

const sequenceTemplate = [
    {
		key: 'speak',
		blocks: [
			{
				key: 'audio',
                title: 'Audio',
				inTime: 0,
				outTime: 10000
			}
		]
	},
    {
		key: 'video',
		blocks: [
			{
				key: 'footage',
				title: 'Footage',
				inTime: 0,
				outTime: 10000
            },

		]
	},

]

const sequence = createSequence({
			initialData: ,
			duration: 30000,
			options: {
                // Will make the editor snap values to a frame rate of 30 fps
				roundingBase: () => {
					return (1 / 30) * 1000
				},
			    errorHandler: (error) => {
					console.error('sequence editor error', error);
				}
			}
		});

const { options, duration } = sequence;

```

Render the component with the sequence object as a prop.

```html
<Sequence {options} {duration} {sequence} />
```

## Styling with tailwind

svelte-sequence-editor uses tailwind for styling.
