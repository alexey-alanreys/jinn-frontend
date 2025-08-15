import { toSnakeCaseParams } from '@/utils/to-snake-case-params.util';

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
	 * @param {number} [updatedAfter] Unix timestamp. If provided, returns
	 *        empty response if context has not been updated since this time.
	 * @returns {Promise<Object>} Resolves with base context data.
	 * @throws {Error} If validation fails or request errors occur.
	 */
	async get(contextId, updatedAfter) {
		this._validateRequired({ contextId }, 'contextId is required');

		const queryParams = updatedAfter
			? toSnakeCaseParams({ updatedAfter })
			: undefined;

		return this._executeRequest({
			path: `/contexts/${contextId}`,
			method: 'GET',
			queryParams,
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
}

export const contextsService = new ContextsService();
