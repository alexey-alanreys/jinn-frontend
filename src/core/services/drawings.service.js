import { stateService } from '@/core/services/state.service';
import { storageService } from '@/core/services/storage.service';

import { STATE_KEYS } from '@/constants/state-keys.constants';

import { ExecutionService } from '@/api/services/execution.service';

/**
 * @module drawingsService
 * @description
 * Service for managing chart drawings with
 * persistence across contexts and chart API integration.
 */
class DrawingsService {
	#storageKey = 'drawings';
	#isVisible = true;
	#drawings = [];

	/**
	 * Current visibility state of drawings.
	 *
	 * @type {boolean}
	 */
	get isVisible() {
		return this.#isVisible;
	}

	/**
	 * Initializes the drawings service by cleaning up orphaned
	 * drawings for contexts that are no longer active.
	 */
	async init() {
		const statuses = await ExecutionService.getAllStatuses();
		const activeContextIds = Object.entries(statuses)
			.filter(([_, status]) => status === 'READY')
			.map(([contextId]) => contextId);

		const stored = storageService.getItem(this.#storageKey) || {};
		const drawingTypes = Object.keys(stored);

		drawingTypes.forEach((type) => {
			this.#cleanupOrphanedDrawings(activeContextIds, type);
		});
	}

	/**
	 * Gets all drawing series for the current context from storage.
	 *
	 * @param {string} drawingType Type of drawings to get.
	 * @returns {array} Array of drawing data for current context.
	 */
	get(drawingType) {
		const contextId = this.#getContextId();
		if (!contextId) return [];

		const stored = storageService.getItem(this.#storageKey) || {};
		return stored[drawingType]?.[contextId] || [];
	}

	/**
	 * Sets drawing series for the current context in storage.
	 *
	 * @param {string} drawingType Type of drawings to set.
	 * @param {array} drawings Array of drawing data to store.
	 */
	set(drawingType, drawings) {
		const contextId = this.#getContextId();
		if (!contextId) return;

		const stored = storageService.getItem(this.#storageKey) || {};

		if (!stored[drawingType]) {
			stored[drawingType] = {};
		}

		stored[drawingType][contextId] = drawings;
		storageService.setItem(this.#storageKey, stored);
	}

	/**
	 * Adds a new drawing series to the beginning of the drawings array.
	 *
	 * @param {string} drawingType Type of drawings.
	 * @param {object} data Drawing data to add.
	 */
	add(drawingType, data) {
		const current = this.get(drawingType);
		this.set(drawingType, [data, ...current]);
	}

	/**
	 * Clears all stored drawings for the current context.
	 *
	 * @param {string} [drawingType] Specific drawing type to clear,
	 *        or all if not provided.
	 */
	clear(drawingType = null) {
		if (drawingType) {
			this.set(drawingType, []);
		} else {
			const types = this.getTypes();
			types.forEach((type) => this.set(type, []));
		}
	}

	/**
	 * Gets available drawing types from storage.
	 *
	 * @returns {string[]} Array of available drawing type names.
	 */
	getTypes() {
		const stored = storageService.getItem(this.#storageKey) || {};
		return Object.keys(stored);
	}

	/**
	 * Loads drawings for the current context from storage.
	 * Creates chart series and updates internal drawings array.
	 *
	 * @param {string} drawingType Type of drawings to load.
	 * @param {object} seriesClass Chart series class constructor.
	 * @param {object} seriesOptions Options for creating series.
	 */
	load(drawingType, seriesClass, seriesOptions) {
		const chartApi = this.#getChartApi();

		if (!chartApi) return;

		const contextData = this.get(drawingType);
		if (!contextData.length) return;

		const series = contextData.map((data) => {
			const lineSeries = chartApi.addSeries(seriesClass, seriesOptions);
			lineSeries.setData(data);
			return lineSeries;
		});

		this.#drawings = series;
	}

	/** Shows all drawings by setting their visibility to true. */
	show() {
		if (!this.#drawings.length) return;

		this.#drawings.forEach((series) => {
			series.applyOptions({ visible: true });
		});

		this.#isVisible = true;
	}

	/** Hides all drawings by setting their visibility to false. */
	hide() {
		if (!this.#drawings.length) return;

		this.#drawings.forEach((series) => {
			series.applyOptions({ visible: false });
		});

		this.#isVisible = false;
	}

	/** Removes all drawing series from chart and clears state. */
	removeAll() {
		const chartApi = this.#getChartApi();
		if (!chartApi) return;

		this.#drawings.forEach((series) => chartApi.removeSeries(series));
		this.#drawings = [];
	}

	/**
	 * Gets the current context ID from state service.
	 *
	 * @private
	 * @returns {string|null} Current context ID or null if not available.
	 */
	#getContextId() {
		const context = stateService.get(STATE_KEYS.CONTEXT);
		return context.id || null;
	}

	/**
	 * Gets the chart API instance from state service.
	 *
	 * @private
	 * @returns {object|null} Chart API instance or null if not available.
	 */
	#getChartApi() {
		return stateService.get(STATE_KEYS.CHART_API) || null;
	}

	/**
	 * Removes drawings data for non-existing contexts.
	 *
	 * @private
	 * @param {string[]} contextIds Array of active context IDs.
	 * @param {string} type Drawing type to clean up.
	 */
	#cleanupOrphanedDrawings(contextIds, type) {
		const storedData = storageService.getItem(this.#storageKey) || {};
		const typeData = storedData[type] || {};

		const filteredTypeData = Object.fromEntries(
			Object.entries(typeData).filter(([contextId]) =>
				contextIds.includes(contextId),
			),
		);

		storageService.setItem(this.#storageKey, {
			...storedData,
			[type]: filteredTypeData,
		});
	}
}

export const drawingsService = new DrawingsService();
