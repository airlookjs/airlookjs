Resources:

TODO:

- SPACER blocks
- Errors readable store
- Finish SVG render example
- maintain cursor on window √
- drag handles with pointer diff not absolute position, so that it doesn't jump around √
  -- snap the timebar to cursor position when hovering over it
  -- component to draw a vertical line for the current time
- optional remove block button

future:

- optional inline add block button to add in between
- ability to move blocks between layers
- ability to change block order

Drag and drop with flip animation:
https://svelte.dev/repl/b225504c9fea44b189ed5bfb566df6e6?version=3.52.0

SVG drag to resize: https://svelte.dev/repl/fd9d2216e7e243d49de8fae39ecc6fe8?version=3.37.0

Svelte gantt chart: https://github.com/ANovokmet/svelte-gantt

Move resize with snap: https://svelte.dev/repl/019b68fb023a44b3a8427b3538ca3b1d?version=3.37.0

Small screen recording editor:
https://github.com/mattorchard/vippet

svg layer:

<svg
          width="100%"
          height="100%"
          style:margin-top="var(--bar-margin-top, 4px)"
          style:margin-bottom="var(--bar-margin-bottom, 10px)"
        >

            <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                style:fill="var(--bg-color, {data.color})"
            />

            <text y="20px" x="8px">

            </text>

    </svg>
