import { request } from '@/core/libs/request.lib';
import { NotificationService } from '@/core/services/notification.service';

/**
 * Service for interacting with backend data API endpoints.
 */
export class DataService {
	#BASE_URL = '/api';
	#notificationService = new NotificationService();

	/**
	 * Fetches strategy alerts from the backend.
	 *
	 * @param {function} onSuccess
	 * - Callback executed on successful response with data.
	 * @param {function} [onError]
	 * - Optional callback executed on error.
	 * @returns {Promise<void>}
	 */
	getAlerts(onSuccess, onError) {
		return request({
			path: `${this.#BASE_URL}/alerts`,
			method: 'GET',
			onSuccess,
			onError: (error) => {
				this.#handleError('Error fetching alerts', error, onError);
			},
		});
	}

	/**
	 * Fetches the summary of strategies.
	 *
	 * @param {function} onSuccess
	 * - Callback executed on successful response with data.
	 * @param {function} [onError]
	 * - Optional callback executed on error.
	 * @returns {Promise<void>}
	 */
	getSummary(onSuccess, onError) {
		return request({
			path: `${this.#BASE_URL}/summary`,
			method: 'GET',
			onSuccess,
			onError: (error) => {
				this.#handleError('Error fetching summary', error, onError);
			},
		});
	}

	/**
	 * Fetches data updates.
	 *
	 * @param {function} onSuccess
	 * - Callback executed on successful response with data.
	 * @param {function} [onError]
	 * - Optional callback executed on error.
	 * @returns {Promise<void>}
	 */
	getUpdates(onSuccess, onError) {
		return request({
			path: `${this.#BASE_URL}/updates`,
			method: 'GET',
			onSuccess,
			onError: (error) => {
				this.#handleError('Error fetching updates', error, onError);
			},
		});
	}

	/**
	 * Fetches chart details for a given strategy context ID.
	 *
	 * @param {string} contextId
	 * - Strategy context identifier.
	 * @param {function} onSuccess
	 * - Callback executed on successful response with data.
	 * @param {function} [onError]
	 * - Optional callback executed on error.
	 * @returns {Promise<void>}
	 * @throws {Error} Throws if contextId is falsy.
	 */
	getChartDetails(contextId, onSuccess, onError) {
		if (!contextId) {
			throw new Error('contextId is required');
		}
		return request({
			path: `${this.#BASE_URL}/details/chart/${contextId}`,
			method: 'GET',
			onSuccess,
			onError: (error) => {
				this.#handleError('Error fetching chart details', error, onError);
			},
		});
	}

	/**
	 * Fetches report overview data.
	 *
	 * @param {string} contextId
	 * - Strategy context identifier.
	 * @param {function} onSuccess
	 * - Callback executed on successful response with data.
	 * @param {function} [onError]
	 * - Optional callback executed on error.
	 * @returns {Promise<void>}
	 * @throws {Error} Throws if contextId is falsy.
	 */
	getReportOverview(contextId, onSuccess, onError) {
		if (!contextId) {
			throw new Error('contextId is required');
		}
		return request({
			path: `${this.#BASE_URL}/report/overview/${contextId}`,
			method: 'GET',
			onSuccess,
			onError: (error) => {
				this.#handleError('Error fetching report overview', error, onError);
			},
		});
	}

	/**
	 * Fetches report metrics data.
	 *
	 * @param {string} contextId
	 * - Strategy context identifier.
	 * @param {function} onSuccess
	 * - Callback executed on successful response with data.
	 * @param {function} [onError]
	 * - Optional callback executed on error.
	 * @returns {Promise<void>}
	 * @throws {Error} Throws if contextId is falsy.
	 */
	getReportMetrics(contextId, onSuccess, onError) {
		if (!contextId) {
			throw new Error('contextId is required');
		}
		return request({
			path: `${this.#BASE_URL}/report/metrics/${contextId}`,
			method: 'GET',
			onSuccess,
			onError: (error) => {
				this.#handleError('Error fetching report metrics', error, onError);
			},
		});
	}

	/**
	 * Fetches report trades data.
	 *
	 * @param {string} contextId
	 * - Strategy context identifier.
	 * @param {function} onSuccess
	 * - Callback executed on successful response with data.
	 * @param {function} [onError]
	 * - Optional callback executed on error.
	 * @returns {Promise<void>}
	 * @throws {Error} Throws if contextId is falsy.
	 */
	getReportTrades(contextId, onSuccess, onError) {
		if (!contextId) {
			throw new Error('contextId is required');
		}
		return request({
			path: `${this.#BASE_URL}/report/trades/${contextId}`,
			method: 'GET',
			onSuccess,
			onError: (error) => {
				this.#handleError('Error fetching report trades', error, onError);
			},
		});
	}

	/**
	 * Updates a parameter value for a specific strategy context.
	 *
	 * @param {string} contextId
	 * - Strategy context identifier.
	 * @param {string} param
	 * - Parameter name to update.
	 * @param {*} value
	 * - New value for the parameter.
	 * @param {function} onSuccess
	 * - Callback executed on successful update.
	 * @param {function} [onError]
	 * - Optional callback executed on error.
	 * @returns {Promise<void>}
	 * @throws {Error} Throws if contextId or param is falsy.
	 */
	updateContext(contextId, param, value, onSuccess, onError) {
		if (!contextId || !param) {
			throw new Error('contextId and param are required');
		}
		return request({
			path: `${this.#BASE_URL}/contexts/${contextId}`,
			method: 'PATCH',
			body: { param, value },
			onSuccess,
			onError: (error) => {
				this.#handleError('Error updating parameter', error, onError);
			},
		});
	}

	/**
	 * Handles errors by logging and showing notification.
	 *
	 * @param {string} message
	 * - Error message to log and display.
	 * @param {*} error
	 * - Error object or response.
	 * @param {function} [callback]
	 * - Optional callback for further error handling.
	 */
	#handleError(message, error, callback) {
		console.error(message, error);

		try {
			this.#notificationService.show('error', message);
		} catch (err) {
			console.warn('Notification display failed:', err);
		}

		if (callback) {
			callback(error);
		}
	}
}

export const dataService = new DataService();
