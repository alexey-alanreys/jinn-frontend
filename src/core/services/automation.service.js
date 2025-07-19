import { contextsService } from '@/api/services/contexts.service.js';
import { stateService } from '@/core/services/state.service.js';


/**
 * @module automationService
 * @description
 * Periodically checks for context updates during AUTOMATION mode.
 * If the current context has changed, it triggers reactive update.
 */
class AutomationService {
	#intervalId = null;
	#intervalMs = 5000;

	/**
	 * Starts polling the backend for updated context IDs.
	 *
	 * If the current context is among the updated ones,
	 * its reference is reassigned to trigger reactive updates
	 * in subscribed components.
	 */
	start() {
		if (this.#intervalId !== null) return;

		this.#intervalId = setInterval(async () => {
			try {
				const updatedIds = await contextsService.getUpdates();
				const currentContext = stateService.get('context');

				if (updatedIds.includes(currentContext.id)) {
					stateService.set('context', { ...currentContext });
				}
			} catch (error) {
				console.error('Failed to fetch IDs of updated contexts.', error);
			}
		}, this.#intervalMs);
	}

	/**
	 * Stops the polling process.
	 */
	stop() {
		if (this.#intervalId !== null) {
			clearInterval(this.#intervalId);
			this.#intervalId = null;
		}
	}
}

export const automationService = new AutomationService();
