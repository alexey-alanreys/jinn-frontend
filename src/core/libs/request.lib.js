import { SERVER_URL } from '@/config/url.config';

/**
 * @module request
 * @description
 * Minimalistic library for handling API requests.
 * Provides HTTP request functionality with error handling.
 */

/**
 * Extracts an error message from an error object.
 *
 * @param {Object} error
 * - Error object containing a message.
 * @param {string|Object} error.message
 * - Error message, can be a string or an object.
 * @returns {string} Extracted error message.
 */
export function extractErrorMessage(error) {
	return typeof error.message === 'object' ? error.message[0] : error.message;
}

/**
 * Performs an HTTP request to the API.
 *
 * @param {Object} options
 * - Request configuration.
 * @param {string} options.path
 * - API endpoint path.
 * @param {'GET'|'POST'|'PATCH'|'DELETE'|'PUT'} [options.method='GET']
 * - HTTP method to use for the request.
 * @param {Object|null} [options.body=null]
 * - JSON payload to send with the request.
 * @param {Object} [options.headers={}]
 * - Additional headers to include in the request.
 * @param {Function|null} [options.onSuccess=null]
 * - Callback called on success with response data.
 * @param {Function|null} [options.onError=null]
 * - Callback called on error with error message.
 * @returns {Promise<{isLoading: boolean, data: any|null, error: string|null}>}
 * A promise resolving to the state of the request.
 */
export async function request({
	path,
	method = 'GET',
	body = null,
	headers = {},
	onSuccess = null,
	onError = null,
}) {
	let isLoading = true;
	let error = null;
	let data = null;

	const url = `${SERVER_URL}/api${path}`;
	const requestOptions = {
		method,
		headers: {
			'Content-Type': 'application/json',
			...headers,
		},
	};

	if (body) {
		requestOptions.body = JSON.stringify(body);
	}

	try {
		const response = await fetch(url, requestOptions);

		if (response.ok) {
			data = await response.json();

			if (onSuccess) onSuccess(data);
		} else {
			const errorResponse = await response.json();
			error = extractErrorMessage(errorResponse);

			if (onError) onError(error);
		}
	} catch (err) {
		error = extractErrorMessage(err);

		if (onError) onError(error);
	} finally {
		isLoading = false;
	}

	return { isLoading, data, error };
}
