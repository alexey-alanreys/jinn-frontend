import { stateService } from '@/core/services/state.service.js';

import { ALERTS_FETCH_LIMIT } from '@/constants/alerts.constants';
import { STATE_KEYS } from '@/constants/state-keys.constants';

import { alertsService } from '@/api/services/alerts.service.js';
import { executionService } from '@/api/services/execution.service.js';

/**
 * @module liveTradingService
 * @description
 * Manages live trading mode:
 * - Subscribes to current context and contexts collection
 * - Updates context data from backend in live mode
 * - Polls for alerts when at least one context is live
 */
class LiveTradingService {
	static POLLING_INTERVAL = 5000;

	#contextIntervalId = null;
	#alertsIntervalId = null;

	/**
	 * Initializes the live trading service by subscribing to context
	 * and contexts changes and applying initial state updates.
	 */
	init() {
		stateService.subscribe(
			STATE_KEYS.CONTEXT,
			this.#handleContextChange.bind(this),
		);
		stateService.subscribe(
			STATE_KEYS.CONTEXTS,
			this.#handleContextsChange.bind(this),
		);

		this.#handleContextChange(stateService.get(STATE_KEYS.CONTEXT));
		this.#handleContextsChange(stateService.get(STATE_KEYS.CONTEXTS));
	}

	/**
	 * Handles updates of single current context.
	 * Starts/stops polling ExecutionService depending on isLive flag.
	 */
	#handleContextChange(context) {
		if (!context || !Object.keys(context).length) {
			this.#stopContextPolling();
			return;
		}

		if (context.isLive) {
			this.#startContextPolling();
		} else {
			this.#stopContextPolling();
		}
	}

	/**
	 * Handles updates of all contexts collection.
	 * If at least one context has isLive=true, starts alerts polling.
	 */
	#handleContextsChange(contexts) {
		if (!contexts || !Object.keys(contexts).length) {
			this.#stopAlertsPolling();
			return;
		}

		const hasLive = Object.values(contexts).some((c) => c?.isLive);
		if (hasLive) {
			this.#startAlertsPolling();
		} else {
			this.#stopAlertsPolling();
		}
	}

	/** Starts polling ExecutionService for context updates. */
	#startContextPolling() {
		if (this.#contextIntervalId !== null) return;

		this.#contextIntervalId = setInterval(async () => {
			try {
				const candlestickSeries = stateService.get(STATE_KEYS.CANDLE_SERIES);
				const context = stateService.get(STATE_KEYS.CONTEXT);
				if (!context.id || !candlestickSeries) return;

				const updatedContext = await executionService.get(
					context.id,
					candlestickSeries.data().at(-1).time * 1000,
				);

				if (Object.keys(updatedContext).length) {
					const [[id, data]] = Object.entries(updatedContext);
					stateService.set(STATE_KEYS.CONTEXT, { id, ...data });
				}
			} catch (error) {
				console.error('Failed to fetch updated context.', error);
			}
		}, LiveTradingService.POLLING_INTERVAL);
	}

	/** Stops polling ExecutionService for context updates. */
	#stopContextPolling() {
		if (this.#contextIntervalId !== null) {
			clearInterval(this.#contextIntervalId);
			this.#contextIntervalId = null;
		}
	}

	/** Starts polling alertsService for new alerts. */
	#startAlertsPolling() {
		if (this.#alertsIntervalId !== null) return;

		this.#alertsIntervalId = setInterval(async () => {
			try {
				const currentAlerts = stateService.get(STATE_KEYS.ALERTS) || [];
				const lastAlertId = currentAlerts.length
					? currentAlerts.at(-1).alertId
					: null;

				const newAlerts = lastAlertId
					? await alertsService.get({ sinceId: lastAlertId })
					: await alertsService.get({ limit: ALERTS_FETCH_LIMIT });

				if (newAlerts.length) {
					stateService.set(STATE_KEYS.ALERTS, newAlerts);
				}
			} catch (error) {
				console.error('Failed to fetch alerts.', error);
			}
		}, LiveTradingService.POLLING_INTERVAL);
	}

	/** Stops polling alertsService for new alerts. */
	#stopAlertsPolling() {
		if (this.#alertsIntervalId !== null) {
			clearInterval(this.#alertsIntervalId);
			this.#alertsIntervalId = null;
		}
	}
}

export const liveTradingService = new LiveTradingService();
