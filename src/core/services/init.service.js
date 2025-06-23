import { stateService } from '@/core/services/state.service.js';

import { contextsService } from '@/api/services/contexts.service';

/**
 * Service for initial application data loading.
 * Provides essential data for other components to work with backend.
 */
class InitService {
	/**
	 * Loads initial summary data and sets contextId.
	 * Stores results in global state for other components to use.
	 */
	async initialize() {
		const contexts = await contextsService.getAll();
		const contextId = Object.keys(contexts)[0];

		stateService.set('contexts', contexts);
		stateService.set('contextId', contextId);
	}
}

export const initService = new InitService();
