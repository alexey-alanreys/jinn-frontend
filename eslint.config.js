import js from '@eslint/js';

export default [
	js.configs.recommended,

	{
		ignores: ['**/dist/*'],
	},
	{
		files: ['**/*.js'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				clearTimeout: 'readonly',
				console: 'readonly',
				DOMParser: 'readonly',
				document: 'readonly',
				HTMLElement: 'readonly',
				fetch: 'readonly',
				localStorage: 'readonly',
				module: 'readonly',
				process: 'readonly',
				require: 'readonly',
				setTimeout: 'readonly',
				__dirname: 'readonly',
				window: 'readonly',
			},
		},
		linterOptions: {
			reportUnusedDisableDirectives: true,
		},
		rules: {
			'no-console': 'off',
			'require-jsdoc': 'off',
			'no-tabs': 'off',
			'no-trailing-spaces': 'off',
			indent: 'off',
			'no-debugger': 'off',
			'padded-blocks': 'off',
			'prefer-default-export': 'off',
			'no-prototype-builtins': 'off',
			'no-mixed-spaces-and-tabs': 'off',
		},
		settings: {
			'import/resolver': {
				alias: {
					map: [['@', './src']],
					extensions: ['.js'],
				},
			},
		},
	},
];
