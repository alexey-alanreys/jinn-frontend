import { BaseService } from '@/api/core/base.service';

/**
 * @module contextsService
 * @description
 * Service for interacting with strategy contexts API endpoints.
 */
class ContextsService extends BaseService {
	/**
	 * Fetches summary information for all strategy contexts.
	 *
	 * @returns {Promise<Object>} Resolves with summarized data
	 *          for all active contexts.
	 * @throws {Error} If request errors occur.
	 */
	async getAll() {
		return this._executeRequest({
			path: '/contexts',
			method: 'GET',
			errorMessage: 'Failed to load strategy list',
		});
	}

	/**
	 * Fetches summary information for specific strategy context.
	 *
	 * @param {string} contextId Unique identifier of the strategy context.
	 * @returns {Promise<Object>} Resolves with base context data.
	 * @throws {Error} If validation fails or request errors occur.
	 */
	async get(contextId) {
		this._validateRequired({ contextId }, 'contextId is required');

		return this._executeRequest({
			path: `/contexts/${contextId}`,
			method: 'GET',
			errorMessage: 'Failed to load strategy data',
		});
	}

	/**
	 * Updates parameter in strategy context and restarts strategy.
	 *
	 * @param {string} contextId Unique identifier of the strategy context.
	 * @param {string} param Parameter name to update.
	 * @param {*} value New value for the parameter.
	 * @returns {Promise<{status: string}>} Resolves with operation status.
	 * @throws {Error} If validation fails or request errors occur.
	 */
	async update(contextId, param, value) {
		this._validateRequired(
			{ contextId, param },
			'contextId and param are required',
		);

		return this._executeRequest({
			path: `/contexts/${contextId}`,
			method: 'PATCH',
			body: { param, value },
			errorMessage: 'Failed to update strategy parameter',
		});
	}

	/**
	 * Removes strategy context from active contexts.
	 *
	 * @param {string} contextId Unique identifier of the strategy context.
	 * @returns {Promise<{status: string}>} Resolves with operation status.
	 * @throws {Error} If validation fails or request errors occur.
	 */
	async delete(contextId) {
		this._validateRequired({ contextId }, 'contextId is required');

		return this._executeRequest({
			path: `/contexts/${contextId}`,
			method: 'DELETE',
			errorMessage: 'Failed to delete strategy',
		});
	}

	/**
	 * Fetches IDs of contexts that were recently updated.
	 *
	 * @returns {Promise<Array<string>>} Resolves with list of
	 *          updated context IDs.
	 * @throws {Error} If request errors occur.
	 */
	async getUpdates() {
		return this._executeRequest({
			path: '/contexts/updates',
			method: 'GET',
			errorMessage: 'Failed to fetch updates list',
		});
	}
}

export const contextsService = new ContextsService();
