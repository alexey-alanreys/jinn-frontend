import { BaseService } from '@/api/core/base.service';

/**
 * @module reportService
 * @description
 * Service for interacting with report-related API endpoints.
 */
class ReportService extends BaseService {
	/**
	 * Fetches overview metrics data.
	 *
	 * @param {string} contextId Strategy context identifier.
	 * @returns {Promise<Object>} Resolves with overview metrics data.
	 * @throws {Error} If validation fails or request errors occur.
	 */
	async getOverviewMetrics(contextId) {
		this._validateRequired({ contextId }, 'contextId is required');

		return this._executeRequest({
			path: `/report/overview/${contextId}/metrics`,
			method: 'GET',
			errorMessage: 'Failed to load report metrics',
		});
	}

	/**
	 * Fetches overview equity data.
	 *
	 * @param {string} contextId Strategy context identifier.
	 * @returns {Promise<Object>} Resolves with overview equity data.
	 * @throws {Error} If validation fails or request errors occur.
	 */
	async getOverviewEquity(contextId) {
		this._validateRequired({ contextId }, 'contextId is required');

		return this._executeRequest({
			path: `/report/overview/${contextId}/equity`,
			method: 'GET',
			errorMessage: 'Failed to load report equity',
		});
	}

	/**
	 * Fetches report metrics data.
	 *
	 * @param {string} contextId Strategy context identifier.
	 * @returns {Promise<Object>} Resolves with report metrics.
	 * @throws {Error} If validation fails or request errors occur.
	 */
	async getMetrics(contextId) {
		this._validateRequired({ contextId }, 'contextId is required');

		return this._executeRequest({
			path: `/report/metrics/${contextId}`,
			method: 'GET',
			errorMessage: 'Failed to load report metrics',
		});
	}

	/**
	 * Fetches report trades data.
	 *
	 * @param {string} contextId Strategy context identifier.
	 * @returns {Promise<Object>} Resolves with report trades.
	 * @throws {Error} If validation fails or request errors occur.
	 */
	async getTrades(contextId) {
		this._validateRequired({ contextId }, 'contextId is required');

		return this._executeRequest({
			path: `/report/trades/${contextId}`,
			method: 'GET',
			errorMessage: 'Failed to load report trades',
		});
	}
}

export const reportService = new ReportService();
