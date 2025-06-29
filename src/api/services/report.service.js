import { BaseService } from '@/api/core/base.service';

/**
 * @module reportService
 * @description
 * Service for interacting with report-related API endpoints.
 */
class ReportService extends BaseService {
	/**
	 * Fetches report overview data.
	 *
	 * @param {string} contextId Strategy context identifier.
	 * @returns {Promise<Object>} Resolves with report overview.
	 * @throws {Error} If validation fails or request errors occur.
	 */
	async getOverview(contextId) {
		this._validateRequired({ contextId }, 'contextId is required');

		return this._executeRequest({
			path: `/report/overview/${contextId}`,
			method: 'GET',
			errorMessage: 'Не удалось загрузить обзор отчёта',
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
			errorMessage: 'Не удалось загрузить метрики отчёта',
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
			errorMessage: 'Не удалось загрузить сделки отчёта',
		});
	}
}

export const reportService = new ReportService();
