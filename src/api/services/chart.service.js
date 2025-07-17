import { BaseService } from '@/api/core/base.service';

/**
 * @module chartService
 * @description
 * Service for interacting with chart-related API endpoints.
 */
class ChartService extends BaseService {
	/**
	 * Fetches klines (candlestick) data for chart visualization.
	 *
	 * @param {string} contextId Strategy context identifier.
	 * @returns {Promise<Array>} Resolves with formatted klines data.
	 * @throws {Error} If validation fails or request errors occur.
	 */
	async getKlines(contextId) {
		this._validateRequired({ contextId }, 'contextId is required');

		return this._executeRequest({
			path: `/chart/klines/${contextId}`,
			method: 'GET',
			errorMessage: 'Failed to load candlestick data',
		});
	}

	/**
	 * Fetches technical indicators data for chart visualization.
	 *
	 * @param {string} contextId Strategy context identifier.
	 * @returns {Promise<Object>} Resolves with formatted indicators data.
	 * @throws {Error} If validation fails or request errors occur.
	 */
	async getIndicators(contextId) {
		this._validateRequired({ contextId }, 'contextId is required');

		return this._executeRequest({
			path: `/chart/indicators/${contextId}`,
			method: 'GET',
			errorMessage: 'Failed to load indicator data',
		});
	}

	/**
	 * Fetches deals (entry/exit points) for chart visualization.
	 *
	 * @param {string} contextId Strategy context identifier.
	 * @returns {Promise<Array>} Resolves with formatted deals.
	 * @throws {Error} If validation fails or request errors occur.
	 */
	async getDeals(contextId) {
		this._validateRequired({ contextId }, 'contextId is required');

		return this._executeRequest({
			path: `/chart/deals/${contextId}`,
			method: 'GET',
			errorMessage: 'Failed to load deal markers',
		});
	}
}

export const chartService = new ChartService();
