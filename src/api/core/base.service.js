import { request } from '@/core/libs/request.lib';
import { notificationService } from '@/core/services/notification.service';

/**
 * @module baseService
 * @description
 * Base API service with common functionality for all API services.
 */
export class BaseService {
	#BASE_URL = '/api';

	/**
	 * Handles API request execution with error processing.
	 *
	 * @protected
	 * @param {string} path Endpoint path.
	 * @param {string} method HTTP method.
	 * @param {Object} [body] Request payload.
	 * @param {Object} [queryParams] Query parameters.
	 * @param {string} errorMessage Context for error reporting.
	 * @returns {Promise<Object>} Response data.
	 * @throws {Error} If request errors occur.
	 */
	async _executeRequest({ path, method, body, queryParams, errorMessage }) {
		try {
			const { data, error } = await request({
				path: this.#getFullUrl(path, queryParams),
				method,
				body,
			});

			if (error) {
				throw new Error(error);
			}

			return data;
		} catch (error) {
			this.#handleError(errorMessage);
			throw error;
		}
	}

	/**
	 * Validates that required parameters are provided.
	 *
	 * @protected
	 * @param {Object} params Parameters to validate (key-value pairs).
	 * @param {string} [message] Custom error message.
	 * @throws {Error} If any required parameters are missing.
	 */
	_validateRequired(params, message) {
		const missing = Object.entries(params)
			.filter(([_, value]) => !value)
			.map(([key]) => key);

		if (missing.length) {
			throw new Error(
				message || `Missing required parameters: ${missing.join(', ')}`,
			);
		}
	}

	/**
	 * Constructs the full URL for the endpoint.
	 *
	 * @private
	 * @param {string} endpoint The endpoint path.
	 * @param {Object} [queryParams] Query parameters.
	 * @returns {string} The full URL.
	 */
	#getFullUrl(endpoint, queryParams) {
		let url = `${this.#BASE_URL}${endpoint}`;

		if (queryParams) {
			const params = new URLSearchParams();

			Object.entries(queryParams).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					params.append(key, value.toString());
				}
			});

			url += `?${params.toString()}`;
		}

		return url;
	}

	/**
	 * Handles errors by logging and showing notification.
	 *
	 * @private
	 * @param {string} message Error message to log and display.
	 */
	#handleError(message) {
		try {
			if (message) notificationService.show('error', message);
		} catch (err) {
			console.error('Notification display failed:', err);
		}
	}
}
