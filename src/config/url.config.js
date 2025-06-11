export const SERVER_URL =
	typeof window.SERVER_URL === 'string' && !window.SERVER_URL.startsWith('{')
		? window.SERVER_URL
		: import.meta.env.VITE_SERVER_URL;
