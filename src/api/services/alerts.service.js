import { BaseService } from '@/api/core/base.service';

/**
 * Service for interacting with strategy alerts API endpoints.
 */
class AlertsService extends BaseService {
	/**
	 * Fetches all active strategy alerts.
	 *
	 * @param {number} [limit] Maximum number of recent alerts to return.
	 * @returns {Promise<Object>} Resolves with dictionary of active alerts.
	 * @throws {Error} If request errors occur.
	 */
	async getAll(limit) {
		const queryParams = limit ? { limit } : undefined;

		return this._executeRequest({
			path: '/alerts',
			method: 'GET',
			queryParams,
			errorMessage: 'Не удалось загрузить оповещения',
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
			errorMessage: 'Не удалось удалить оповещение',
		});
	}

	/**
	 * Fetches new alerts that haven't been fetched yet and clears the buffer.
	 *
	 * @returns {Promise<Object>} Resolves with dictionary of new alerts.
	 * @throws {Error} If request errors occur.
	 */
	async getNew() {
		return this._executeRequest({
			path: '/alerts/new',
			method: 'GET',
			errorMessage: 'Не удалось получить новые оповещения',
		});
	}
}

export const alertsService = new AlertsService();
