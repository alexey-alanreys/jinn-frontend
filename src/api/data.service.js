import { request } from '@/core/libs/request.lib';
import { NotificationService } from '@/core/services/notification.service';

/**
 * Service for interacting with backend data API endpoints.
 */
class DataService {
	#BASE_URL = '/api';
	#notificationService = new NotificationService();

	/**
	 * Fetches strategy alerts.
	 *
	 * @returns {Promise<Object>} Resolves with alerts.
	 * @throws {Error} If request errors occur.
	 */
	async getAlerts() {
		const data = await this.#executeRequest({
			path: `${this.#BASE_URL}/alerts`,
			method: 'GET',
			errorMessage: 'Error fetching alerts',
		});
		return data;
	}

	/**
	 * Fetches the summary of strategies.
	 *
	 * @returns {Promise<Object>} Resolves with summary.
	 * @throws {Error} If request errors occur.
	 */
	async getSummary() {
		const data = await this.#executeRequest({
			path: `${this.#BASE_URL}/summary`,
			method: 'GET',
			errorMessage: 'Error fetching summary',
		});
		return data;
	}

	/**
	 * Fetches data updates.
	 *
	 * @returns {Promise<Object>} Resolves with data updates.
	 * @throws {Error} If request errors occur.
	 */
	async getUpdates() {
		const data = await this.#executeRequest({
			path: `${this.#BASE_URL}/updates`,
			method: 'GET',
			errorMessage: 'Error fetching updates',
		});
		return data;
	}

	/**
	 * Fetches chart details for a given strategy context ID.
	 *
	 * @param {string} contextId
	 * - Strategy context identifier.
	 * @returns {Promise<Object>} Resolves with chart details.
	 * @throws {Error} If validation fails or request errors occur.
	 */
	async getChartDetails(contextId) {
		this.#validateRequired({ contextId }, 'contextId is required');

		const data = await this.#executeRequest({
			path: `${this.#BASE_URL}/details/chart/${contextId}`,
			method: 'GET',
			errorMessage: 'Error fetching chart details',
		});
		return data;
	}

	/**
	 * Fetches report overview data.
	 *
	 * @param {string} contextId
	 * - Strategy context identifier.
	 * @returns {Promise<Object>} Resolves with report overview.
	 * @throws {Error} If validation fails or request errors occur.
	 */
	async getReportOverview(contextId) {
		this.#validateRequired({ contextId }, 'contextId is required');

		const data = await this.#executeRequest({
			path: `${this.#BASE_URL}/report/overview/${contextId}`,
			method: 'GET',
			errorMessage: 'Error fetching report overview',
		});
		return data;
	}

	/**
	 * Fetches report metrics data.
	 *
	 * @param {string} contextId
	 * - Strategy context identifier.
	 * @returns {Promise<Object>} Resolves with report metrics.
	 * @throws {Error} If validation fails or request errors occur..
	 */
	async getReportMetrics(contextId) {
		this.#validateRequired({ contextId }, 'contextId is required');

		const data = await this.#executeRequest({
			path: `${this.#BASE_URL}/report/metrics/${contextId}`,
			method: 'GET',
			errorMessage: 'Error fetching report metrics',
		});
		return data;
	}

	/**
	 * Fetches report trades data.
	 *
	 * @param {string} contextId
	 * - Strategy context identifier.
	 * @returns {Promise<Object>} Resolves with report trades.
	 * @throws {Error} If validation fails or request errors occur.
	 */
	async getReportTrades(contextId) {
		this.#validateRequired({ contextId }, 'contextId is required');

		const data = await this.#executeRequest({
			path: `${this.#BASE_URL}/report/trades/${contextId}`,
			method: 'GET',
			errorMessage: 'Error fetching report trades',
		});
		return data;
	}

	/**
	 * Updates a parameter value for a specific strategy context.
	 *
	 * @param {string} contextId - Strategy context identifier.
	 * @param {string} param - Parameter name to update.
	 * @param {*} value - New value for the parameter.
	 * @returns {Promise<{status: string, type?: string}>} Resolves
	 * with operation status.
	 * @throws {Error} If validation fails or request errors occur.
	 */
	async updateContext(contextId, param, value) {
		this.#validateRequired(
			{ contextId, param },
			'contextId and param are required',
		);

		const data = await this.#executeRequest({
			path: `${this.#BASE_URL}/contexts/${contextId}`,
			method: 'PATCH',
			body: { param, value },
			errorMessage: 'Error updating parameter',
		});
		return data;
	}

	async #executeRequest({ path, method, body, errorMessage }) {
		try {
			const { data, error } = await request({ path, method, body });

			if (error) {
				throw new Error(error);
			}

			return data;
		} catch (error) {
			this.#handleError(errorMessage, error);
			throw error;
		}
	}

	/**
	 * Validates that required parameters are provided.
	 *
	 * @param {Object} params
	 * - Parameters to validate (key-value pairs).
	 * @param {string} [message]
	 * - Custom error message (default: lists missing params).
	 * @throws {Error} If any required parameters are missing.
	 */
	#validateRequired(params, message) {
		const missing = Object.entries(params)
			.filter(([_, value]) => !value)
			.map(([key]) => key);

		if (missing.length > 0) {
			throw new Error(
				message || `Missing required parameters: ${missing.join(', ')}`,
			);
		}
	}

	/**
	 * Handles errors by logging and showing notification.
	 *
	 * @param {string} message
	 * - Error message to log and display.
	 * @param {*} error
	 * - Error object or response.
	 */
	#handleError(message, error) {
		console.error(message, error);

		try {
			this.#notificationService.show('error', message);
		} catch (err) {
			console.warn('Notification display failed:', err);
		}
	}
}

export const dataService = new DataService();
