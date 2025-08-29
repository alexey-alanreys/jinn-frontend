import { stateService } from '@/core/services/state.service.js';

import { ExecutionService } from '@/api/services/execution.service.js';

/**
 * @module automationService
 * @description
 * Periodically checks for context updates during AUTOMATION mode.
 * If the current context has changed, it triggers reactive update.
 */
class AutomationService {
	#intervalId = null;
	#pollingInterval = 5000;

	/**
	 * Starts polling the backend for updated context.
	 */
	start() {
		if (this.#intervalId !== null) return;

		this.#intervalId = setInterval(async () => {
			try {
				const candlestickSeries = stateService.get('candlestickSeries');
				const context = stateService.get('context');

				const updatedContext = await ExecutionService.get(
					context.id,
					candlestickSeries.data().at(-1).time * 1000,
				);

				if (Object.keys(updatedContext).length) {
					const [[id, data]] = Object.entries(updatedContext);
					stateService.set('context', { id, ...data });
				}
			} catch (error) {
				console.error('Failed to fetch updated context.', error);
			}
		}, this.#pollingInterval);
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
