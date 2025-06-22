import { request } from '@/core/libs/request.lib';
import { notificationService } from '@/core/services/notification.service';

/**
 * Service for interacting with backend data API endpoints.
 */
class DataService {
	#BASE_URL = '/api';

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
			errorMessage: 'Не удалось загрузить оповещения',
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
			errorMessage: 'Не удалось загрузить сводку',
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
			errorMessage: 'Не удалось загрузить обновления',
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
			errorMessage: 'Не удалось загрузить данные графика',
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
			errorMessage: 'Не удалось загрузить обзор отчёта',
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
			errorMessage: 'Не удалось загрузить метрики отчёта',
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
			errorMessage: 'Не удалось загрузить сделки по отчёту',
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
			errorMessage: 'Не удалось изменить параметр стратегии',
		});
		return data;
	}

	/**
	 * Handles API request execution with error processing.
	 *
	 * @private
	 * @param {string} path
	 * - Endpoint path.
	 * @param {string} method
	 * - HTTP method.
	 * @param {Object} [body]
	 * - Request payload.
	 * @param {string} errorMessage
	 * - Context for error reporting.
	 * @returns {Promise<Object>} Response data.
	 * @throws {Error} If request errors occur.
	 */
	async #executeRequest({ path, method, body, errorMessage }) {
		try {
			const { data, error } = await request({ path, method, body });

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
	 * @private
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
	 * @private
	 * @param {string} message
	 * - Error message to log and display.
	 */
	#handleError(message) {
		try {
			notificationService.show('error', message);
		} catch (err) {
			console.error('Notification display failed:', err);
		}
	}
}

export const dataService = new DataService();
