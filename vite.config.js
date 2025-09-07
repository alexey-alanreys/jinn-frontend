import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import string from 'vite-plugin-string';

export default ({ mode }) => {
	const env = loadEnv(mode, process.cwd());

	return defineConfig({
		base: '/',
		define: {
			'import.meta.env.VITE_SERVER_URL': JSON.stringify(env.VITE_SERVER_URL),
		},
		resolve: {
			alias: {
				'@': path.resolve(__dirname, './src'),
			},
		},
		root: process.cwd(),
		publicDir: path.resolve(__dirname, 'public'),
		build: {
			outDir: path.resolve(__dirname, 'dist'),
			emptyOutDir: true,
		},
		server: {
			port: 5173,
			host: 'localhost',
		},
		plugins: [
			string({
				include: ['**/*.html'],
				exclude: ['index.html'],
			}),
		],
	});
};
