// Issue with nx handling this file as a module when named .js, we use ESLINT_USE_FLAT_CONFIG https://github.com/nrwl/nx/issues/22576
import nxPlugin from '@nx/eslint-plugin';
//import baseConfig from './eslint.base.config.js';
import eslint from '@eslint/js';
import globals from 'globals';
import jsoncParser from 'jsonc-eslint-parser';
import tseslint from 'typescript-eslint';
import eslintPluginSvelte from 'eslint-plugin-svelte';

//import ts from '@typescript-eslint/eslint-plugin';
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

	eslint.configs.recommended,
	...tseslint.configs.recommendedTypeChecked,
  	...tseslint.configs.stylisticTypeChecked,
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
				project: ['./tsconfig.json', './packages/*/tsconfig.json'],
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
				  sourceTag: '*',
				  onlyDependOnLibsWithTags: ['*'],
				},
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
	  },
	  /*
	  {
		files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
		rules: {
		  '@nx/enforce-module-boundaries': [
			'error',
			{
			  enforceBuildableLibDependency: true,
			  allow: [],
			  depConstraints: [
				{
				  sourceTag: '*',
				  onlyDependOnLibsWithTags: ['*'],
				},
			  ],
			},
		  ],
		},
	  },*/

	/*parser: '@typescript-eslint/parser',
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:svelte/recommended',
		'prettier'
	],
	plugins: ['@typescript-eslint'],
	ignorePatterns: ['*.cjs', 'dist/*'],
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			// Parse the `<script>` in `.svelte` as TypeScript by adding the following configuration.
			parserOptions: {
				parser: '@typescript-eslint/parser'
			}
		}
	],
	settings: {
		'svelte3/typescript': () => require('typescript')
	},
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	},
	rules: {
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
    }*/
);
