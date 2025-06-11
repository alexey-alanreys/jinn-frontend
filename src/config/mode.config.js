export const API_MODE =
	typeof window.API_MODE === 'string' && !window.API_MODE.startsWith('{')
		? window.API_MODE
		: import.meta.env.VITE_API_MODE;
