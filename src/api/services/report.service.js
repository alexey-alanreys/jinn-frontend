import { BaseService } from '@/api/core/base.service';

/**
 * @module reportService
 * @description
 * Service for interacting with report-related API endpoints.
 */
class ReportService extends BaseService {
	/**
	 * Fetches overview metrics.
	 *
	 * @param {string} contextId Strategy context identifier.
	 * @returns {Promise<Object>} Resolves with overview metrics.
	 * @throws {Error} If validation fails or request errors occur.
	 */
	async getOverviewMetrics(contextId) {
		this._validateRequired({ contextId }, 'contextId is required');

		return this._executeRequest({
			path: `/report/metrics/${contextId}/overview`,
			method: 'GET',
			errorMessage: 'Failed to load overview metrics',
		});
	}

	/**
	 * Fetches performance metrics.
	 *
	 * @param {string} contextId Strategy context identifier.
	 * @returns {Promise<Object>} Resolves with performance metrics.
	 * @throws {Error} If validation fails or request errors occur.
	 */
	async getPerformanceMetrics(contextId) {
		this._validateRequired({ contextId }, 'contextId is required');

		return this._executeRequest({
			path: `/report/metrics/${contextId}/performance`,
			method: 'GET',
			errorMessage: 'Failed to load performance metrics',
		});
	}

	/**
	 * Fetches trade-related metrics.
	 *
	 * @param {string} contextId Strategy context identifier.
	 * @returns {Promise<Object>} Resolves with trade-related metrics.
	 * @throws {Error} If validation fails or request errors occur.
	 */
	async getTradeMetrics(contextId) {
		this._validateRequired({ contextId }, 'contextId is required');

		return this._executeRequest({
			path: `/report/metrics/${contextId}/trades`,
			method: 'GET',
			errorMessage: 'Failed to load trade-related metrics',
		});
	}

	/**
	 * Fetches risk-related metrics.
	 *
	 * @param {string} contextId Strategy context identifier.
	 * @returns {Promise<Object>} Resolves with risk-related metrics.
	 * @throws {Error} If validation fails or request errors occur.
	 */
	async getRiskMetrics(contextId) {
		this._validateRequired({ contextId }, 'contextId is required');

		return this._executeRequest({
			path: `/report/metrics/${contextId}/risk`,
			method: 'GET',
			errorMessage: 'Failed to load risk-related metrics',
		});
	}

	/**
	 * Fetches report trades.
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
