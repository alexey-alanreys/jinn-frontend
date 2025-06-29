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
	 * 1. Loads available contexts from backend
	 * 2. Initializes application state with fresh data
	 * 3. Performs storage maintenance (cleanup of orphaned data)
	 */
	async initialize() {
		const contexts = await contextsService.getAll();
		const [id, data] = Object.entries(contexts)[0];
		const context = { id, ...data };

		stateService.set('contexts', contexts);
		stateService.set('context', context);
		stateService.set('drawings', []);

		this.cleanupOrphanedDrawings(Object.keys(contexts));
	}

	/**
	 * Removes drawings data for non-existing contexts.
	 *
	 * @param {string[]} contextIds
	 */
	cleanupOrphanedDrawings(contextIds, type = 'trendlines') {
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
