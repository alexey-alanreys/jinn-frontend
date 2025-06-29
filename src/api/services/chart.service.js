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
			errorMessage: 'Не удалось загрузить данные свечей',
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
			errorMessage: 'Не удалось загрузить данные индикаторов',
		});
	}

	/**
	 * Fetches trade markers (entry/exit points) for chart visualization.
	 *
	 * @param {string} contextId Strategy context identifier.
	 * @returns {Promise<Array>} Resolves with formatted trade markers.
	 * @throws {Error} If validation fails or request errors occur.
	 */
	async getMarkers(contextId) {
		this._validateRequired({ contextId }, 'contextId is required');

		return this._executeRequest({
			path: `/chart/markers/${contextId}`,
			method: 'GET',
			errorMessage: 'Не удалось загрузить маркеры сделок',
		});
	}

	/**
	 * Fetches all chart data (klines, indicators, markers) in a single request.
	 *
	 * @param {string} contextId Strategy context identifier.
	 * @returns {Promise<Object>} Resolves with all chart data.
	 * @throws {Error} If validation fails or request errors occur.
	 */
	async getAllChartData(contextId) {
		this._validateRequired({ contextId }, 'contextId is required');

		const [klines, indicators, markers] = await Promise.all([
			this.getKlines(contextId),
			this.getIndicators(contextId),
			this.getMarkers(contextId),
		]);

		return { klines, indicators, markers };
	}
}

export const chartService = new ChartService();
