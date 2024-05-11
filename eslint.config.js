// TODO: use esm and add type module to package.json when nx supports it upstream https://github.com/nrwl/nx/issues/22576
const nxPlugin = require('@nx/eslint-plugin');
//import baseConfig from './eslint.base.config.js';
const eslint = require('@eslint/js');
//const globals = require('globals');
const jsoncParser = require('jsonc-eslint-parser');
const tseslint = require('typescript-eslint');
const eslintPluginSvelte = require('eslint-plugin-svelte');

//import ts from '@typescript-eslint/eslint-plugin';

module.exports = tseslint.config(
	{ plugins: { '@nx': nxPlugin } },
	{
		// config with just ignores is the replacement for `.eslintignore`
		ignores: [
		  //'**/jest.config.js',
		  '**/node_modules/**',
		  '**/dist/**',
		  '**/fixtures/**',
		  '**/coverage/**',
		  '**/build/**',
		  '**/bin/**',
		  '**/lib/**',
		  '**/.svelte-kit/**',
		],
	},

	eslint.configs.recommended,
	...tseslint.configs.recommendedTypeChecked,
  	...tseslint.configs.stylisticTypeChecked,
	...eslintPluginSvelte.configs['flat/recommended'],  

	{
		languageOptions: {
			/*globals: {
				...globals.es2020,
				...globals.node,
				...globals.browser
			},*/
			parserOptions: {
				allowAutomaticSingleRunInference: true,
				//sourceType: 'module',
				tsconfigRootDir: __dirname,
				project: true
			}
		  
		},
		rules: {
		  /*'@typescript-eslint/explicit-module-boundary-types': ['error'],*/
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
/*	{
		files: ['*.json'],
		languageOptions: {
		  parser: jsoncParser,
		},
		rules: {},
	  },
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
