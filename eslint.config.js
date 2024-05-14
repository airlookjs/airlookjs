// Issue with nx handling this file as a module when named .js, we use ESLINT_USE_FLAT_CONFIG https://github.com/nrwl/nx/issues/22576
import nxPlugin from '@nx/eslint-plugin';
//import baseConfig from './eslint.base.config.js';
// @ts-expect-error TODO: get types for '@eslint/js'
import eslint from '@eslint/js';
import globals from 'globals';
import jsoncParser from 'jsonc-eslint-parser';
import tseslint from 'typescript-eslint';
import eslintPluginSvelte from 'eslint-plugin-svelte';

export default tseslint.config(
	{ plugins: { '@nx': nxPlugin } },
	{
		ignores: [
		  '**/node_modules/**',
		  '**/dist/**',
		  '**/fixtures/**',
		  '**/coverage/**',
		  '**/build/**',
		  '**/bin/**',
		  '**/.svelte-kit',
		],
	},

	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
	eslint.configs.recommended,
	...tseslint.configs.recommendedTypeChecked,
  	...tseslint.configs.stylisticTypeChecked,
	// @ts-expect-error we probably need to modify our tsconfig for this file, this works and follows documentation, maybe types are out of sync between deps
	...eslintPluginSvelte.configs['flat/recommended'],
	
	{
		languageOptions: {
			ecmaVersion: 2022,
			globals: {
				//...globals.es2020,
				...globals.node,
				//...globals.browser
			},
			parserOptions: {
				//allowAutomaticSingleRunInference: true,
				//sourceType: 'module',
				tsconfigRootDir: import.meta.dirname,
				//project: true,
				project: ['./tsconfig.json', './packages/*/tsconfig.json', './libs/*/tsconfig.json'],
				extraFileExtensions: ['.svelte'],
			}
		},
		settings: {
			svelte: {
				compileOptions: {
					postcss: {
						configFilePath: './packages/*/postcss.config.cjs'
					}
				}
			}
		}
	},

	{
		files: ['**/*.svelte'],
		languageOptions: {
			//parser: svelteParser,
			parserOptions: {
				parser: tseslint.parser,
			},
		},
	},

	{
		files: ['**/*.ts'],
		rules: {
			'@typescript-eslint/explicit-module-boundary-types': ['error'],
			"@typescript-eslint/no-unused-vars": [
			  "error",
			  {
			  args: "all",
			  argsIgnorePattern: "^_",
			  caughtErrors: "all",
			  caughtErrorsIgnorePattern: "^_",
			  destructuredArrayIgnorePattern: "^_",
			  varsIgnorePattern: "^_",
			  ignoreRestSiblings: true
			  }
		  ]
		  },
	},
	{
		files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
		rules: {
		  '@nx/enforce-module-boundaries': [
			'error',
			{
			  enforceBuildableLibDependency: true,
			  allow: [],
			  depConstraints: [
				{
					sourceTag: "scope:shared",
					onlyDependOnLibsWithTags: ["scope:shared"]
				},
				{
					sourceTag: "type:app",
					onlyDependOnLibsWithTags: ["type:util", "type:ui"]
				},
				{
					sourceTag: "type:ui",
					onlyDependOnLibsWithTags: ["type:ui", "type:util"]
				},
				{
					sourceTag: "type:util",
					onlyDependOnLibsWithTags: ["type:util"]
				  }

			  ],
			},
		  ],
		},
	},
	{
		files: ['*.json'],
		languageOptions: {
		  parser: jsoncParser,
		},
		rules: {},
	  }
);
