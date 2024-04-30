import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [vitePreprocess({
		postcss: true
	})],
	kit: {
		adapter: adapter(),
		paths: {
			base: process.argv.includes('dev') ? '' : process.env.BASE_PATH
        }
	}
};

export default config;
