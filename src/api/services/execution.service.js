import { toSnakeCaseParams } from '@/utils/to-snake-case-params.util';

import { BaseService } from '@/api/core/base.service';

/**
 * @module executionService
 * @description
 * Service for interacting with strategy execution contexts API endpoints.
 */
class ExecutionService extends BaseService {
	/**
	 * Fetches summary information for all strategy execution contexts.
	 *
	 * @returns {Promise<Object>} Resolves with summarized data
	 *          for all active execution contexts.
	 * @throws {Error} If request errors occur.
	 */
	async getAll() {
		return this._executeRequest({
			path: '/contexts/execution',
			method: 'GET',
			errorMessage: 'Failed to load execution contexts',
		});
	}

	/**
	 * Fetches summary information for specific strategy execution context.
	 *
	 * @param {string} contextId Unique identifier of the strategy context.
	 * @param {number} [updatedAfter] Unix timestamp in milliseconds.
	 *        If provided, returns an empty response if no newer klines exist.
	 * @returns {Promise<Object>} Resolves with base context data.
	 *          Returns empty object if no updates.
	 * @throws {Error} If validation fails or request errors occur.
	 */
	async get(contextId, updatedAfter) {
		this._validateRequired({ contextId }, 'contextId is required');

		const queryParams = updatedAfter
			? toSnakeCaseParams({ updatedAfter })
			: undefined;

		return this._executeRequest({
			path: `/contexts/execution/${contextId}`,
			method: 'GET',
			queryParams,
			errorMessage: 'Failed to load execution context data',
		});
	}

	/**
	 * Adds new strategy execution contexts to the processing queue.
	 *
	 * @param {Object} configs Configuration object with context definitions.
	 *        Each key is a context_id, each value contains strategy config
	 *        with strategy, symbol, interval, exchange, is_live, params, etc.
	 * @returns {Promise<{added: string[]}>} Resolves with list of successfully
	 *          queued context identifiers.
	 * @throws {Error} If validation fails or request errors occur.
	 */
	async add(configs) {
		this._validateRequired({ configs }, 'configs is required');

		const snakeCaseConfigs = Object.fromEntries(
			Object.entries(configs).map(([contextId, contextConfig]) => [
				contextId,
				toSnakeCaseParams(contextConfig),
			]),
		);

		return this._executeRequest({
			path: '/contexts/execution',
			method: 'POST',
			body: snakeCaseConfigs,
			errorMessage: 'Failed to add execution contexts',
		});
	}

	/**
	 * Updates parameter in strategy execution context and recomputes metrics.
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
			path: `/contexts/execution/${contextId}`,
			method: 'PATCH',
			body: { param, value },
			errorMessage: 'Failed to update execution context parameter',
		});
	}

	/**
	 * Removes strategy context from active execution contexts.
	 *
	 * @param {string} contextId Unique identifier of the strategy context.
	 * @returns {Promise<{status: string}>} Resolves with operation status.
	 * @throws {Error} If validation fails or request errors occur.
	 */
	async delete(contextId) {
		this._validateRequired({ contextId }, 'contextId is required');

		return this._executeRequest({
			path: `/contexts/execution/${contextId}`,
			method: 'DELETE',
			errorMessage: 'Failed to delete execution context',
		});
	}

	/**
	 * Fetches current statuses for all strategy execution contexts.
	 *
	 * @returns {Promise<Object>} Resolves with status data
	 *          for all strategy execution contexts.
	 * @throws {Error} If request errors occur.
	 */
	async getAllStatuses() {
		return this._executeRequest({
			path: '/contexts/execution/status',
			method: 'GET',
			errorMessage: 'Failed to load execution contexts statuses',
		});
	}

	/**
	 * Fetches current status for specific strategy execution context.
	 *
	 * @param {string} contextId Unique identifier of the strategy context.
	 * @returns {Promise<{status: string}>} Resolves with context status.
	 *          Returns null if context doesn't exist.
	 * @throws {Error} If validation fails or request errors occur.
	 */
	async getStatus(contextId) {
		this._validateRequired({ contextId }, 'contextId is required');

		return this._executeRequest({
			path: `/contexts/execution/${contextId}/status`,
			method: 'GET',
			errorMessage: 'Failed to load execution context status',
		});
	}
}

export const executionService = new ExecutionService();
