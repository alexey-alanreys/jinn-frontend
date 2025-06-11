export const API_URL =
	typeof window.API_URL === 'string' && !window.API_URL.startsWith('{')
		? window.API_URL
		: import.meta.env.VITE_API_URL;
