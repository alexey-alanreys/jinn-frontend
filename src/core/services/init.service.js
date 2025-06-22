import { stateService } from '@/core/services/state.service.js';

import { dataService } from '@/api/data.service.js';

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
		const summary = await dataService.getSummary();
		const contextId = Object.keys(summary)[0];

		stateService.set('summary', summary);
		stateService.set('contextId', contextId);
	}
}

export const initService = new InitService();
