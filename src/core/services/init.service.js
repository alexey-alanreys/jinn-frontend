import { stateService } from '@/core/services/state.service.js';
import { storageService } from '@/core/services/storage.service';

import { contextsService } from '@/api/services/contexts.service';

/**
 * @module initService
 * @description
 * Service for initial application data loading.
 * Provides essential data for other components to work with backend.
 */
class InitService {
	/**
	 * Performs application initialization:
	 * 1. Initializes application theme;
	 * 2. Loads available contexts from backend;
	 * 3. Initializes application state with fresh data;
	 * 4. Performs storage maintenance (cleanup of orphaned data).
	 */
	async initialize() {
		this.#initializeTheme();
		const contextIds = await this.#initializeState();
		this.#cleanupOrphanedDrawings(contextIds);
	}

	/**
	 * Initializes application theme from storage or uses default.
	 */
	#initializeTheme() {
		const savedTheme = storageService.getItem('theme') || 'light';
		document.documentElement.setAttribute('data-theme', savedTheme);
		stateService.set('theme', savedTheme);
	}

	/**
	 * Loads contexts and initializes application state.
	 *
	 * @returns {Promise<string[]>} Array of context IDs.
	 */
	async #initializeState() {
		const contexts = await contextsService.getAll();
		const [id, data] = Object.entries(contexts)[0];
		const context = { id, ...data };

		stateService.set('contexts', contexts);
		stateService.set('context', context);
		stateService.set('drawings', []);

		return Object.keys(contexts);
	}

	/**
	 * Removes drawings data for non-existing contexts.
	 *
	 * @param {string[]} contextIds
	 * @param {string} [type='trendlines']
	 */
	#cleanupOrphanedDrawings(contextIds, type = 'trendlines') {
		const storedData = storageService.getItem('drawings') || { [type]: {} };
		const typeData = storedData[type] || {};

		const filteredTypeData = Object.fromEntries(
			Object.entries(typeData).filter(([contextId]) =>
				contextIds.includes(contextId),
			),
		);

		storageService.setItem('drawings', {
			...storedData,
			[type]: filteredTypeData,
		});
	}
}

export const initService = new InitService();
