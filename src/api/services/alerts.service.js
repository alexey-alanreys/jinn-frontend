import { toSnakeCaseParams } from '@/utils/to-snake-case-params.util';

import { BaseService } from '@/api/core/base.service';

/**
 * @module alertsService
 * @description
 * Service for interacting with strategy alerts API endpoints.
 */
class AlertsService extends BaseService {
	/**
	 * Fetches active strategy alerts with optional filtering.
	 *
	 * @param {Object} [options] Request options.
	 * @param {number} [options.limit] Maximum number of recent alerts to return.
	 * @param {string} [options.sinceId] Alert identifier for filtering.
	 *        Only alerts created after this ID will be returned.
	 * @returns {Promise<Array>} Resolves with formatted alerts data.
	 * @throws {Error} If validation fails or request errors occur.
	 */
	async get({ limit, sinceId } = {}) {
		if (sinceId) {
			this._validateRequired({ sinceId }, 'sinceId is required');
		}

		const queryParams = {};
		if (limit) queryParams.limit = limit;
		if (sinceId) queryParams.sinceId = sinceId;

		const finalQueryParams =
			Object.keys(queryParams).length > 0
				? toSnakeCaseParams(queryParams)
				: undefined;

		return this._executeRequest({
			path: '/alerts',
			method: 'GET',
			queryParams: finalQueryParams,
			errorMessage: 'Failed to load alerts',
		});
	}

	/**
	 * Removes alert from active alerts collection.
	 *
	 * @param {string} alertId Unique identifier of the alert.
	 * @returns {Promise<{status: string}>} Resolves with operation status.
	 * @throws {Error} If validation fails or request errors occur.
	 */
	async delete(alertId) {
		this._validateRequired({ alertId }, 'alertId is required');

		return this._executeRequest({
			path: `/alerts/${alertId}`,
			method: 'DELETE',
			errorMessage: 'Failed to delete alert',
		});
	}
}

export const alertsService = new AlertsService();
