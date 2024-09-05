import globals from 'globals';
import tseslint from 'typescript-eslint';
import baseConfig from '../../eslint.base.config.js';
export default tseslint.config(
  ...baseConfig,
	{
		languageOptions: {
			ecmaVersion: 2022,
			globals: {
				...globals.node,
			},
			parser: tseslint.parser,
			parserOptions: {
				tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: ['.json'],
				project: ['tsconfig.lib.json', 'tsconfig.spec.json'],
			}
		},
	},

);
