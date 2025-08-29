import { BaseService } from '@/api/core/base.service';

/**
 * @module dataService
 * @description
 * Service for interacting with data API endpoints.
 */
class DataService extends BaseService {
	/**
	 * Fetches supported cryptocurrency exchanges.
	 *
	 * @returns {Promise<string[]>} Resolves with array of supported exchanges.
	 * @throws {Error} If request errors occur.
	 */
	async getExchanges() {
		return this._executeRequest({
			path: '/data/exchanges',
			method: 'GET',
			errorMessage: 'Failed to load supported exchanges',
		});
	}

	/**
	 * Fetches supported kline intervals.
	 *
	 * @returns {Promise<string[]>} Resolves with array of supported intervals.
	 * @throws {Error} If request errors occur.
	 */
	async getIntervals() {
		return this._executeRequest({
			path: '/data/intervals',
			method: 'GET',
			errorMessage: 'Failed to load supported intervals',
		});
	}

	/**
	 * Fetches registry of all available strategies with their parameters.
	 *
	 * @returns {Promise<Object>} Resolves with strategy registry containing
	 *          strategy names, parameters, labels, and indicator options.
	 * @throws {Error} If request errors occur.
	 */
	async getStrategies() {
		return this._executeRequest({
			path: '/data/strategies',
			method: 'GET',
			errorMessage: 'Failed to load strategy registry',
		});
	}
}

export const dataService = new DataService();
