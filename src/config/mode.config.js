export const SERVER_MODE =
	typeof window.SERVER_MODE === 'string' && !window.SERVER_MODE.startsWith('{')
		? window.SERVER_MODE
		: import.meta.env.VITE_SERVER_MODE;
