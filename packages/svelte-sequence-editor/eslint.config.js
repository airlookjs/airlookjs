import globals from 'globals';
import tseslint from 'typescript-eslint';
// eslint-disable-next-line @nx/enforce-module-boundaries
import baseConfig from '../../eslint.base.config.js';
import eslintPluginSvelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';

export default tseslint.config(
  ...baseConfig,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  ...eslintPluginSvelte.configs['flat/recommended'],

  {
		settings: {
			svelte: {
				compileOptions: {
					postcss: {
						configFilePath: 'postcss.config.cjs'
					}

				}
			}
		}
	},

  {
		languageOptions: {
			globals: {
				//...globals.es2020,
				...globals.node,
				...globals.browser
			},
			parserOptions: {
				EXPERIMENTAL_useProjectService: false,
				tsconfigRootDir: import.meta.dirname,
				project: ['../../tsconfig.base.json', 'tsconfig.json'],
				extraFileExtensions: ['.svelte']
			}
		},
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: tseslint.parser,
				project: 'tsconfig.json',
			},
		},
	},

);
