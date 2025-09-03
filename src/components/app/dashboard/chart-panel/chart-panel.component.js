import {
	CandlestickSeries,
	HistogramSeries,
	LineSeries,
	createChart,
	createSeriesMarkers,
} from 'lightweight-charts';

import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { drawingsService } from '@/core/services/drawings.service';
import { renderService } from '@/core/services/render.service';
import { stateService } from '@/core/services/state.service';

import { NoData } from '@/components/ui/dashboard/no-data/no-data.component';
import { Spinner } from '@/components/ui/dashboard/spinner/spinner.component';

import {
	getCandlestickOptions,
	getChartOptions,
	getLineOptions,
} from '@/config/chart.config';

import {
	DATA_BATCH_SIZE,
	VISIBLE_RANGE_PADDING,
} from '@/constants/chart.constants';
import { SPINNER_DELAY_MS } from '@/constants/spinner.constants';
import { STATE_KEYS } from '@/constants/state-keys.constants';
import { TRENDLINE_OPTIONS } from '@/constants/trendline-tool.constants';

import { chartService } from '@/api/services/chart.service';

import styles from './chart-panel.module.css';
import templateHTML from './chart-panel.template.html?raw';

import { IndicatorsInfoPanel } from './indicators-info-panel/indicators-info-panel.component';
import { MainInfoPanel } from './main-info-panel/main-info-panel.component';
import { RulerTool } from './ruler-tool/ruler-tool.component';
import { ScrollButton } from './scroll-button/scroll-button.component';

export class ChartPanel extends BaseComponent {
	static COMPONENT_NAME = 'ChartPanel';
	static INDICATOR_TYPES = {
		line: LineSeries,
		histogram: HistogramSeries,
	};

	#$element;
	#chartApi;

	#contextId = null;
	#firstLoadDone = false;
	#data = {
		candlesticks: null,
		indicators: null,
		deals: null,
	};
	#series = {
		candlestick: null,
		indicators: new Map(),
		deals: null,
	};
	#indicatorPanels = new Map();
	#visibleRange = DATA_BATCH_SIZE;

	set height(height) {
		this.#$element.css('bottom', `${height}px`);
	}

	render() {
		this.#initComponents();
		this.#initDOM();
		this.#setupInitialState();
		return this.element;
	}

	#initComponents() {
		this.spinner = new Spinner();
		this.noData = new NoData();
		this.rulerTool = new RulerTool();
		this.ScrollButton = new ScrollButton();
		this.mainInfoPanel = new MainInfoPanel();
	}

	#initDOM() {
		this.element = renderService.htmlToElement(
			templateHTML,
			[
				this.spinner,
				this.noData,
				this.rulerTool,
				this.ScrollButton,
				this.mainInfoPanel,
			],
			styles,
		);
		this.#$element = $Q(this.element);
	}

	#setupInitialState() {
		this.#initChart();
		this.#attachListeners();
		this.#registerInitialState();
		this.#applyContext();
	}

	#initChart() {
		const chartCanvas = this.#$element.find(
			'[data-ref="chartCanvas"]',
		).element;
		const chartOptions = getChartOptions();

		this.#chartApi = createChart(chartCanvas, chartOptions);
	}

	#attachListeners() {
		stateService.subscribe(
			STATE_KEYS.CONTEXT,
			this.#handleContextUpdate.bind(this),
		);
		stateService.subscribe(STATE_KEYS.THEME, this.#applyOptions.bind(this));
		stateService.subscribe(
			STATE_KEYS.SELECTED_TIME,
			this.#handleSelectedTradeTime.bind(this),
		);

		this.#chartApi.subscribeCrosshairMove(
			this.#handleCrosshairMove.bind(this),
		);
		this.#chartApi
			.timeScale()
			.subscribeVisibleLogicalRangeChange(
				this.#handleVisibleLogicalRangeChange.bind(this),
			);
	}

	#registerInitialState() {
		stateService.set(STATE_KEYS.RULER_TOOL, this.rulerTool);
		stateService.set(STATE_KEYS.CHART_API, this.#chartApi);
		stateService.set(STATE_KEYS.CANDLE_SERIES, null);
	}

	#applyContext() {
		const context = stateService.get(STATE_KEYS.CONTEXT);
		this.#handleContextUpdate(context);
	}

	async #handleContextUpdate(context) {
		if (!context.id) {
			this.#handleEmptyContext();
			return;
		}

		await this.#loadData(context);

		if (this.#contextId !== context.id) {
			this.#contextId = context.id;

			this.#removePanels();
			this.#removeSeries();

			if (this.#hasValidData()) {
				this.#createSeries();
				this.#createPanels();
			}
		}

		this.#updateDisplayState();

		if (!this.#firstLoadDone) {
			this.#firstLoadDone = true;
			this.spinner.hide();
		}
	}

	#applyOptions() {
		this.#applyChartOptions();

		if (this.#hasValidData()) {
			const context = stateService.get(STATE_KEYS.CONTEXT);
			this.#applyCandlestickOptions(context);
			this.#applyIndicatorOptions(context);
		}
	}

	#applyChartOptions() {
		const chartOptions = getChartOptions();
		this.#chartApi.applyOptions(chartOptions);
	}

	#applyCandlestickOptions(context) {
		if (!this.#series.candlestick || !context) return;

		const { precision, minMove } = context;
		const candlestickOptions = getCandlestickOptions();

		this.#series.candlestick.applyOptions({
			...candlestickOptions,
			priceFormat: {
				type: 'price',
				precision,
				minMove,
			},
		});
	}

	#applyIndicatorOptions(context) {
		const lineOptions = getLineOptions();
		const strategies = stateService.get(STATE_KEYS.STRATEGIES);
		const allOptions = strategies[context.strategy].indicatorOptions;

		this.#series.indicators.forEach((series, key) => {
			const options = allOptions[key];
			if (options) {
				series.applyOptions({ ...lineOptions, ...options });
			}
		});
	}

	#handleSelectedTradeTime(time) {
		if (!time || !this.#hasValidData()) return;

		const candles = this.#data.candlesticks;
		let targetIndex = null;

		for (let i = 0; i < candles.length - 1; i++) {
			const current = candles[i].time;
			const next = candles[i + 1].time;

			if (time >= current && time < next) {
				targetIndex = i;
				break;
			}
		}
		if (targetIndex === null) return;

		const neededFrom = candles.length - targetIndex;

		if (neededFrom > this.#visibleRange) {
			this.#visibleRange = neededFrom + DATA_BATCH_SIZE;
			this.#updateSeries();
		}

		const logicalIndex = this.#chartApi
			.timeScale()
			.timeToIndex(candles[targetIndex].time);

		this.#chartApi.timeScale().setVisibleLogicalRange({
			from: logicalIndex - VISIBLE_RANGE_PADDING,
			to: logicalIndex + VISIBLE_RANGE_PADDING,
		});
	}

	#handleCrosshairMove({ logical, point, seriesData, sourceEvent, time }) {
		if (!point || !time || !this.#hasValidData()) return;

		const candlestick = seriesData.get(this.#series.candlestick);

		this.#updateChartInfoPanel(candlestick);
		this.#updateIndicatorPanels(seriesData);
		this.#updateRulerTool({ logical, point, sourceEvent });
	}

	#updateChartInfoPanel(candlestick) {
		if (candlestick) {
			this.mainInfoPanel.update(candlestick);
		}
	}

	#updateIndicatorPanels(seriesData) {
		const indicators = Object.fromEntries(
			[...this.#series.indicators].map(([key, series]) => [
				key,
				seriesData.get(series),
			]),
		);

		this.#indicatorPanels.forEach((panel) => {
			panel.update(indicators);
		});
	}

	#updateRulerTool({ logical, point, sourceEvent }) {
		this.rulerTool.update({
			logical,
			point,
			sourceEvent,
			candlestickSeries: this.#series.candlestick,
		});
	}

	#handleVisibleLogicalRangeChange(newRange) {
		if (!this.#hasValidData()) return;

		if (newRange === null) {
			this.#visibleRange = DATA_BATCH_SIZE;
			return;
		}

		if (this.#visibleRange >= this.#data.candlesticks.length) return;

		if (newRange.from < 50) {
			this.#visibleRange += DATA_BATCH_SIZE;
			this.#updateSeries();
		}
	}

	#handleEmptyContext() {
		this.#contextId = null;

		this.#clearAllData();
		this.#removePanels();
		this.#removeSeries();

		this.noData.show();
		stateService.set(STATE_KEYS.CANDLE_SERIES, null);

		if (!this.#firstLoadDone) {
			this.#firstLoadDone = true;
			this.spinner.hide();
		}
	}

	#updateDisplayState() {
		if (this.#hasValidData()) {
			this.#updateSeries();
			this.#resetInfoPanels();

			this.noData.hide();
			stateService.set(STATE_KEYS.CANDLE_SERIES, this.#series.candlestick);
		} else {
			this.noData.show();
			stateService.set(STATE_KEYS.CANDLE_SERIES, null);
		}
	}

	async #loadData(context) {
		if (!context.id) {
			this.#clearAllData();
			return;
		}

		try {
			await this.#withSpinner(
				Promise.all([
					this.#loadCandlesticks(context.id),
					this.#loadIndicators(context.id),
					this.#loadDeals(context.id),
				]),
			);
		} catch (error) {
			console.error('Error loading chart data.', error);
			this.#clearAllData();
		}
	}

	async #withSpinner(promise) {
		let timer;

		try {
			timer = setTimeout(() => {
				this.spinner.show();
			}, SPINNER_DELAY_MS);

			return await promise;
		} finally {
			clearTimeout(timer);
			this.spinner.hide();
		}
	}

	#clearAllData() {
		this.#data = {
			candlesticks: null,
			indicators: null,
			deals: null,
		};
	}

	async #loadCandlesticks(contextId) {
		try {
			this.#data.candlesticks = await chartService.getKlines(contextId);
		} catch {
			this.#data.candlesticks = [];
		}
	}

	async #loadIndicators(contextId) {
		try {
			this.#data.indicators = await chartService.getIndicators(contextId);
		} catch {
			this.#data.indicators = {};
		}
	}

	async #loadDeals(contextId) {
		try {
			this.#data.deals = await chartService.getDeals(contextId);
		} catch {
			this.#data.deals = [];
		}
	}

	#removePanels() {
		this.#indicatorPanels.forEach((panel) => {
			panel.remove();
		});
		this.#indicatorPanels.clear();
	}

	#removeSeries() {
		this.#removeCandlestickSeries();
		this.#removeIndicatorSeries();
		this.#removeDrawings();
		this.#clearDeals();

		drawingsService.removeAll();
	}

	#removeCandlestickSeries() {
		const candlestick = this.#series.candlestick;

		if (candlestick) {
			this.#chartApi.removeSeries(candlestick);
			this.#series.candlestick = null;
		}
	}

	#removeIndicatorSeries() {
		this.#series.indicators.forEach((series) => {
			this.#chartApi.removeSeries(series);
		});
		this.#series.indicators.clear();
	}

	#removeDrawings() {
		drawingsService.removeAll();
	}

	#clearDeals() {
		this.#series.deals = null;
	}

	#hasValidData() {
		return this.#data.candlesticks && this.#data.candlesticks.length > 0;
	}

	#createSeries() {
		const context = stateService.get(STATE_KEYS.CONTEXT);

		this.#createCandlestickSeries();
		this.#createIndicatorSeries(context);
		this.#createDrawings();

		this.#applyCandlestickOptions(context);
		this.#applyIndicatorOptions(context);
	}

	#createCandlestickSeries() {
		this.#series.candlestick = this.#chartApi.addSeries(CandlestickSeries);
	}

	#createIndicatorSeries(context) {
		const strategies = stateService.get(STATE_KEYS.STRATEGIES);
		const allOptions = strategies[context.strategy].indicatorOptions;

		Object.entries(allOptions).forEach(([name, options]) => {
			const indicatorTypes = ChartPanel.INDICATOR_TYPES;
			const typeKey = options.type ?? 'line';
			const indicatorType = indicatorTypes[typeKey] ?? indicatorTypes.line;
			const paneIndex = Math.max(0, Math.min(3, options.pane ?? 0));

			const series = this.#chartApi.addSeries(
				indicatorType,
				undefined,
				paneIndex,
			);
			this.#series.indicators.set(name, series);
		});
	}

	#createDrawings() {
		this.#createTrendlines();
	}

	#createTrendlines() {
		const contextData = drawingsService.get('trendlines');
		if (!contextData.length) return;

		contextData.forEach((data) => {
			drawingsService.renderSeries(LineSeries, TRENDLINE_OPTIONS, data);
		});
	}

	#createPanels() {
		requestAnimationFrame(() => {
			const context = stateService.get(STATE_KEYS.CONTEXT);
			const strategies = stateService.get(STATE_KEYS.STRATEGIES);
			const allOptions = strategies[context.strategy].indicatorOptions;

			this.#initIndicatorPanels(allOptions);
			const $panes = this.#getPaneContainers();

			this.#renderIndicatorPanels($panes);
		});
	}

	#initIndicatorPanels(allOptions) {
		Object.values(allOptions).forEach((options) => {
			const paneIndex = options.pane ?? 0;

			if (!this.#indicatorPanels.has(paneIndex)) {
				const panel = new IndicatorsInfoPanel();
				this.#indicatorPanels.set(paneIndex, panel);
			}
		});
	}

	#getPaneContainers() {
		return this.#$element
			.findAll('table > tr')
			.slice(0, -1)
			.filter((el) => el.css('height') !== '1px')
			.map((el) => el.find('td > div'));
	}

	#renderIndicatorPanels($panes) {
		$panes.forEach((container, paneIndex) => {
			const panel = this.#indicatorPanels.get(paneIndex);
			if (!panel) return;

			const isPrimaryPane = paneIndex === 0;
			const panelElement = panel.render(isPrimaryPane);

			container.append(panelElement);
		});
	}

	#updateSeries() {
		if (!this.#series.candlestick || !this.#hasValidData()) return;

		this.#updateCandlesticks();
		this.#updateIndicators();
		this.#updateDeals();
	}

	#updateCandlesticks() {
		this.#series.candlestick.setData(
			this.#data.candlesticks.slice(-this.#visibleRange),
		);
	}

	#updateIndicators() {
		if (!Object.values(this.#data.indicators).length) return;

		this.#series.indicators.forEach((series, key) => {
			const data = this.#data.indicators[key];
			series.setData(data.slice(-this.#visibleRange));
		});
	}

	#updateDeals() {
		if (!this.#data.deals.length) return;

		const startTime = this.#series.candlestick.data()[0].time;
		const visibleDeals = this.#data.deals.filter(
			(deal) => deal.time >= startTime,
		);

		if (!this.#series.deals) {
			this.#series.deals = createSeriesMarkers(
				this.#series.candlestick,
				visibleDeals,
			);
		} else {
			this.#series.deals.setMarkers(visibleDeals);
		}
	}

	#resetInfoPanels() {
		if (!this.#hasValidData()) return;

		this.#resetChartInfoPanel();

		requestAnimationFrame(() => {
			this.#resetIndicatorInfoPanels();
		});
	}

	#resetChartInfoPanel() {
		const candlestick = this.#series.candlestick.data().at(-1);
		if (candlestick) {
			this.mainInfoPanel.update(candlestick, true);
		}
	}

	#resetIndicatorInfoPanels() {
		const context = stateService.get(STATE_KEYS.CONTEXT);
		const strategies = stateService.get(STATE_KEYS.STRATEGIES);
		const allOptions = strategies[context.strategy].indicatorOptions;

		const indicatorValues = Object.fromEntries(
			Array.from(this.#series.indicators, ([key, series]) => {
				const data = series.data();
				return [key, data.length > 0 ? data.at(-1) : null];
			}),
		);

		this.#indicatorPanels.forEach((panel, paneIndex) => {
			const indicatorKeys = Object.entries(allOptions)
				.filter(([_, options]) => {
					return (options.pane ?? 0) === paneIndex;
				})
				.map(([key]) => key);

			panel.update(indicatorValues, true, indicatorKeys);
		});
	}
}
