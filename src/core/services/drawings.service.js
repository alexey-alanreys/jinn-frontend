import { stateService } from '@/core/services/state.service';
import { storageService } from '@/core/services/storage.service';

import { STATE_KEYS } from '@/constants/state-keys.constants';
import { STORAGE_KEYS } from '@/constants/storage-keys.constants';

import { executionService } from '@/api/services/execution.service';

/**
 * @module drawingsService
 * @description
 * Service for managing chart drawings with
 * persistence across contexts and chart API integration.
 */
class DrawingsService {
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
		const statuses = await executionService.getAllStatuses();
		const activeContextIds = Object.entries(statuses)
			.filter(([_, status]) => status === 'READY')
			.map(([contextId]) => contextId);

		const drawingTypes = this.getTypes();
		drawingTypes.forEach((type) => {
			this.#cleanupOrphanedDrawings(activeContextIds, type);
		});
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

	/**
	 * Gets all drawing series for the current context from storage.
	 *
	 * @param {string} drawingType Type of drawings to get.
	 * @returns {array} Array of drawing data for current context.
	 */
	get(drawingType) {
		const contextId = this.#getContextId();
		if (!contextId) return [];

		const stored = storageService.getItem(STORAGE_KEYS.DRAWINGS) || {};
		return stored[drawingType]?.[contextId] || [];
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
	 * Sets drawing series for the current context in storage.
	 *
	 * @param {string} drawingType Type of drawings to set.
	 * @param {array} drawings Array of drawing data to store.
	 */
	set(drawingType, drawings) {
		const contextId = this.#getContextId();
		if (!contextId) return;

		const stored = storageService.getItem(STORAGE_KEYS.DRAWINGS) || {};

		if (!stored[drawingType]) {
			stored[drawingType] = {};
		}

		stored[drawingType][contextId] = drawings;
		storageService.setItem(STORAGE_KEYS.DRAWINGS, stored);
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
			const drawingTypes = this.getTypes();
			drawingTypes.forEach((type) => this.set(type, []));
		}
	}

	/**
	 * Gets available drawing types from storage.
	 *
	 * @returns {string[]} Array of available drawing type names.
	 */
	getTypes() {
		const stored = storageService.getItem(STORAGE_KEYS.DRAWINGS) || {};
		return Object.keys(stored);
	}

	/**
	 * Adds a new drawing series to chart and storage for the current context.
	 *
	 * @param {string} drawingType Type of drawings.
	 * @param {class} seriesClass Chart series class constructor.
	 * @param {object} seriesOptions Options for creating series.
	 * @param {array} data Data points for the series.
	 */
	renderSeries(seriesClass, seriesOptions, data) {
		const chartApi = this.#getChartApi();
		if (!chartApi) return;

		const series = chartApi.addSeries(seriesClass, seriesOptions);
		series.setData(data);

		this.#drawings.push(series);
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
		const context = stateService.get(STATE_KEYS.EXECUTION_CONTEXT);
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
		const storedData = storageService.getItem(STORAGE_KEYS.DRAWINGS) || {};
		const typeData = storedData[type] || {};

		const filteredTypeData = Object.fromEntries(
			Object.entries(typeData).filter(([contextId]) =>
				contextIds.includes(contextId),
			),
		);

		storageService.setItem(STORAGE_KEYS.DRAWINGS, {
			...storedData,
			[type]: filteredTypeData,
		});
	}
}

export const drawingsService = new DrawingsService();
