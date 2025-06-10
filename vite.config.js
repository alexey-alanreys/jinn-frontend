import path from 'path';
import { defineConfig } from 'vite';
import string from 'vite-plugin-string';

export default defineConfig({
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	root: path.resolve(__dirname, 'src'),
	publicDir: path.resolve(__dirname, 'public'),
	build: {
		outDir: path.resolve(__dirname, 'dist'),
		emptyOutDir: true,
	},
	plugins: [
		string({
			include: ['**/*.html'],
		}),
	],
});
