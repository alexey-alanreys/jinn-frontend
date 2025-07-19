import js from '@eslint/js';
import pluginImport from 'eslint-plugin-import';
import globals from 'globals';

export default [
	js.configs.recommended,

	{
		ignores: ['**/dist/*', '**/node_modules/*'],
	},
	{
		files: ['**/*.js'],
		plugins: { import: pluginImport },
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				// Browser globals
				...Object.fromEntries(
					Object.entries(globals.browser).map(([key]) => [key, 'readonly']),
				),

				// Project-specific custom globals
				_: 'readonly',

				// Node.js globals (e.g., for Vite config)
				__dirname: 'readonly',
				module: 'readonly',
				process: 'readonly',
			},
		},
		linterOptions: {
			reportUnusedDisableDirectives: true,
		},
		rules: {
			// Core linting rules
			'no-undef': 'error',
			'no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
				},
			],
			'no-var': 'error',
			'prefer-const': 'warn',

			// Import plugin rules
			'import/no-unresolved': ['error', { ignore: ['\\?raw$'] }],
			'import/default': 'error',
			'import/named': 'off',
			'import/order': [
				'warn',
				{
					groups: ['builtin', 'external', 'internal'],
					pathGroups: [
						{
							pattern: '@/**',
							group: 'internal',
						},
					],
					pathGroupsExcludedImportTypes: ['builtin'],
					'newlines-between': 'always',
					alphabetize: {
						order: 'asc',
						caseInsensitive: true,
					},
				},
			],

			// Code style rules
			indent: 'off',
			'no-mixed-spaces-and-tabs': 'off',
			'no-tabs': 'off',
			'no-trailing-spaces': 'off',
			'padded-blocks': 'off',

			// Functionality rules
			'no-console': 'off',
			'no-debugger': 'off',
			'no-prototype-builtins': 'off',
			'prefer-default-export': 'off',
			'require-jsdoc': 'off',
		},
		settings: {
			'import/resolver': {
				node: {
					extensions: ['.js', '.mjs', '.jsx', '.ts', '.tsx'],
					exportConditions: ['production', 'import', 'default'],
				},
				alias: {
					map: [['@', './src']],
					extensions: ['.js', '.jsx', '.ts', '.tsx'],
				},
			},
		},
	},
];
