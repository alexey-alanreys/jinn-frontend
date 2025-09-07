import { BaseService } from '@/api/core/base.service';

/**
 * @module optimizationService
 * @description
 * Service for interacting with strategy optimization contexts API endpoints.
 */
class OptimizationService extends BaseService {
	/**
	 * Fetches summary information for all strategy optimization contexts.
	 *
	 * @returns {Promise<Object>} Resolves with summarized data
	 *          for all active optimization contexts.
	 * @throws {Error} If request errors occur.
	 */
	async getAll() {
		return this._executeRequest({
			path: '/contexts/optimization',
			method: 'GET',
			errorMessage: 'Failed to load optimization contexts',
		});
	}

	/**
	 * Fetches summary information for specific strategy optimization context.
	 *
	 * @param {string} contextId Unique identifier of the strategy context.
	 * @returns {Promise<Object>} Resolves with base context data.
	 * @throws {Error} If validation fails or request errors occur.
	 */
	async get(contextId) {
		this._validateRequired({ contextId }, 'contextId is required');

		return this._executeRequest({
			path: `/contexts/optimization/${contextId}`,
			method: 'GET',
			errorMessage: 'Failed to load optimization context data',
		});
	}

	/**
	 * Adds new strategy optimization contexts to the processing queue.
	 *
	 * @param {Object} configs Configuration object with context definitions.
	 *        Each key is a context_id, each value contains strategy config
	 *        with strategy, symbol, interval, exchange, start, end, etc.
	 * @returns {Promise<{added: string[]}>} Resolves with list of successfully
	 *          queued context identifiers.
	 * @throws {Error} If validation fails or request errors occur.
	 */
	async add(configs) {
		this._validateRequired({ configs }, 'configs is required');

		return this._executeRequest({
			path: '/contexts/optimization',
			method: 'POST',
			body: configs,
			errorMessage: 'Failed to add optimization contexts',
		});
	}

	/**
	 * Removes strategy context from active optimization contexts.
	 *
	 * @param {string} contextId Unique identifier of the strategy context.
	 * @returns {Promise<{status: string}>} Resolves with operation status.
	 * @throws {Error} If validation fails or request errors occur.
	 */
	async delete(contextId) {
		this._validateRequired({ contextId }, 'contextId is required');

		return this._executeRequest({
			path: `/contexts/optimization/${contextId}`,
			method: 'DELETE',
			errorMessage: 'Failed to delete optimization context',
		});
	}

	/**
	 * Fetches current statuses for all strategy optimization contexts.
	 *
	 * @returns {Promise<Object>} Resolves with status data
	 *          for all strategy optimization contexts.
	 * @throws {Error} If request errors occur.
	 */
	async getAllStatuses() {
		return this._executeRequest({
			path: '/contexts/optimization/status',
			method: 'GET',
			errorMessage: 'Failed to load optimization contexts statuses',
		});
	}

	/**
	 * Fetches current status for specific strategy optimization context.
	 *
	 * @param {string} contextId Unique identifier of the strategy context.
	 * @returns {Promise<{status: string}>} Resolves with context status.
	 *          Returns null if context doesn't exist.
	 * @throws {Error} If validation fails or request errors occur.
	 */
	async getStatus(contextId) {
		this._validateRequired({ contextId }, 'contextId is required');

		return this._executeRequest({
			path: `/contexts/optimization/${contextId}/status`,
			method: 'GET',
			errorMessage: 'Failed to load optimization context status',
		});
	}
}

export const optimizationService = new OptimizationService();
