// Issue with nx handling this file as a module when named .js, we use ESLINT_USE_FLAT_CONFIG https://github.com/nrwl/nx/issues/22576
import nxPlugin from '@nx/eslint-plugin';
//import baseConfig from './eslint.base.config.js';
// @ts-expect-error TODO: get types for '@eslint/js'
import eslint from '@eslint/js';
import globals from 'globals';
import jsoncParser from 'jsonc-eslint-parser';
import tseslint from 'typescript-eslint';
import eslintPluginSvelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';

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
		  "**/.svelte-kit/**/*",
      "**/vite.config.ts.timestamp*"
		],
	},
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
		languageOptions: {
      parserOptions: {
        extraFileExtensions: ['.json'],
      },
		},
  },
  {
		files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    ignores: [
      '**/*/eslint.config.js',
    ],
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
  /*{
		files: ['*.json'],
		languageOptions: {
		  parser: jsoncParser,
      parserOptions: {
        extraFileExtensions: ['.json'],
      },
		},
		rules: {},
	},*/
);
