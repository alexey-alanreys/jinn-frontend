import {
	CandlestickSeries,
	HistogramSeries,
	LineSeries,
	createChart,
	createSeriesMarkers,
} from 'lightweight-charts';

import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';
import { stateService } from '@/core/services/state.service';
import { storageService } from '@/core/services/storage.service';

import { Spinner } from '@/components/ui/spinner/spinner.component';

import {
	getCandlestickOptions,
	getChartOptions,
	getLineOptions,
} from '@/config/chart.config';

import {
	DATA_BATCH_SIZE,
	VISIBLE_RANGE_PADDING,
} from '@/constants/chart.constants';
import { TRENDLINE_OPTIONS } from '@/constants/trendline-tool.constants';

import { chartService } from '@/api/services/chart.service';

import styles from './chart.module.css';
import templateHTML from './chart.template.html?raw';

import { ChartInfoPanel } from './chart-info-panel/chart-info-panel.component';
import { IndicatorsInfoPanel } from './indicators-info-panel/indicators-info-panel.component';
import { RulerTool } from './ruler-tool/ruler-tool.component';
import { ScrollToRealtimeButton } from './scroll-to-realtime-button/scroll-to-realtime-button.component';

export class Chart extends BaseComponent {
	static COMPONENT_NAME = 'Chart';
	static indicatorTypes = {
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

	render() {
		this.#initComponents();
		this.#initDOM();
		this.#setupInitialState();

		return this.element;
	}

	set height(height) {
		this.#$element.css('bottom', `${height}px`);
	}

	async update(context) {
		await this.#loadData();

		if (this.#contextId !== context.id) {
			this.#contextId = context.id;

			this.#removePanels();
			this.#removeSeries();

			this.#createSeries();
			this.#createPanels();
			this.#loadDrawings();
		}

		this.#updateSeries();
		this.#resetInfoPanels();

		if (!this.#firstLoadDone) {
			this.#firstLoadDone = true;
			this.spinner.hide();
		}
	}

	#initComponents() {
		this.spinner = new Spinner();
		this.rulerTool = new RulerTool();
		this.chartInfoPanel = new ChartInfoPanel();
		this.scrollToRealtimeButton = new ScrollToRealtimeButton();
	}

	#initDOM() {
		this.element = renderService.htmlToElement(
			templateHTML,
			[
				this.spinner,
				this.rulerTool,
				this.chartInfoPanel,
				this.scrollToRealtimeButton,
			],
			styles,
		);
		this.#$element = $Q(this.element);
	}

	#setupInitialState() {
		this.#initChart();
		this.#attachListeners();
		this.#registerState();
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
		this.#chartApi.subscribeCrosshairMove(
			this.#handleCrosshairMove.bind(this),
		);

		this.#chartApi
			.timeScale()
			.subscribeVisibleLogicalRangeChange(
				this.#handleVisibleLogicalRangeChange.bind(this),
			);

		stateService.subscribe('context', this.update.bind(this));
		stateService.subscribe('theme', this.#applyOptions.bind(this));
		stateService.subscribe(
			'selectedTradeTime',
			this.#handleSelectedTradeTime.bind(this),
		);
	}

	#registerState() {
		stateService.set('rulerTool', this.rulerTool);
		stateService.set('chartApi', this.#chartApi);
	}

	#applyContext() {
		const context = stateService.get('context');
		this.update(context);
	}

	async #loadData() {
		try {
			await Promise.all([
				this.#loadCandlesticks(),
				this.#loadIndicators(),
				this.#loadDeals(),
			]);
		} catch (error) {
			console.error('Error loading chart data.', error);
		}
	}

	async #loadCandlesticks() {
		this.#data.candlesticks = await chartService.getKlines(
			stateService.get('context').id,
		);
	}

	async #loadIndicators() {
		this.#data.indicators = await chartService.getIndicators(
			stateService.get('context').id,
		);
	}

	async #loadDeals() {
		this.#data.deals = await chartService.getDeals(
			stateService.get('context').id,
		);
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
		this.#clearDeals();
		this.#removeDrawings();
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

	#clearDeals() {
		this.#series.deals = null;
	}

	#removeDrawings() {
		const drawings = stateService.get('drawings');
		drawings.forEach((series) => {
			this.#chartApi.removeSeries(series);
		});
		stateService.set('drawings', []);
	}

	#createSeries() {
		this.#createCandlestickSeries();
		this.#createIndicatorSeries();

		this.#applyCandlestickOptions();
		this.#applyIndicatorOptions();
	}

	#createCandlestickSeries() {
		this.#series.candlestick = this.#chartApi.addSeries(CandlestickSeries);
		stateService.set('candlestickSeries', this.#series.candlestick);
	}

	#createIndicatorSeries() {
		const { indicatorOptions } = stateService.get('context');

		Object.entries(indicatorOptions).forEach(([name, options]) => {
			const typeKey = options.type ?? 'line';
			const indicatorType =
				Chart.indicatorTypes[typeKey] ?? Chart.indicatorTypes['line'];
			const paneIndex = Math.max(0, Math.min(3, options.pane ?? 0));

			const series = this.#chartApi.addSeries(
				indicatorType,
				undefined,
				paneIndex,
			);
			this.#series.indicators.set(name, series);
		});
	}

	#createPanels() {
		requestAnimationFrame(() => {
			const context = stateService.get('context');
			const indicatorOptions = context.indicatorOptions ?? {};

			this.#initIndicatorPanels(indicatorOptions);
			const $panes = this.#getPaneContainers();

			this.#renderIndicatorPanels($panes);
		});
	}

	#initIndicatorPanels(indicatorOptions) {
		Object.values(indicatorOptions).forEach((options) => {
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

	#applyOptions() {
		this.#applyChartOptions();
		this.#applyCandlestickOptions();
		this.#applyIndicatorOptions();
	}

	#applyChartOptions() {
		const chartOptions = getChartOptions();
		this.#chartApi.applyOptions(chartOptions);
	}

	#applyCandlestickOptions() {
		const { precision, minMove } = stateService.get('context');
		const сandlestickOptions = getCandlestickOptions();

		this.#series.candlestick.applyOptions({
			...сandlestickOptions,
			priceFormat: {
				type: 'price',
				precision,
				minMove,
			},
		});
	}

	#applyIndicatorOptions() {
		const { indicatorOptions } = stateService.get('context');
		const lineOptions = getLineOptions();

		this.#series.indicators.forEach((series, key) => {
			series.applyOptions({ ...lineOptions, ...indicatorOptions[key] });
		});
	}

	#loadDrawings() {
		const drawings = storageService.getItem('drawings');
		if (!drawings?.trendlines) return;

		const contextTrendlines = drawings.trendlines[this.#contextId];
		if (!contextTrendlines?.length) return;

		const lineSeries = contextTrendlines.map((trendline) => {
			const lineSeries = this.#chartApi.addSeries(
				LineSeries,
				TRENDLINE_OPTIONS,
			);
			lineSeries.setData(trendline);
			return lineSeries;
		});

		stateService.set('drawings', lineSeries);
	}

	#updateSeries() {
		if (!this.#series.candlestick) return;

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
		this.#series.indicators.forEach((series, key) => {
			const data = this.#data.indicators[key];
			series.setData(data.slice(-this.#visibleRange));
		});
	}

	#updateDeals() {
		if (!this.#data.deals) return;

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
		this.#resetChartInfoPanel();

		requestAnimationFrame(() => {
			this.#resetIndicatorInfoPanels();
		});
	}

	#resetChartInfoPanel() {
		const candlestick = this.#series.candlestick.data().at(-1);
		this.chartInfoPanel.update(candlestick, true);
	}

	#resetIndicatorInfoPanels() {
		const context = stateService.get('context');
		const indicatorOptions = context.indicatorOptions ?? {};

		const indicatorValues = Object.fromEntries(
			Array.from(this.#series.indicators, ([key, series]) => [
				key,
				series.data().at(-1),
			]),
		);

		this.#indicatorPanels.forEach((panel, paneIndex) => {
			const indicatorKeys = Object.entries(indicatorOptions)
				.filter(([_, options]) => {
					return (options.pane ?? 0) === paneIndex;
				})
				.map(([key]) => key);

			panel.update(indicatorValues, true, indicatorKeys);
		});
	}

	#handleCrosshairMove({ logical, point, seriesData, sourceEvent, time }) {
		if (!point || !time) return;

		const candlestick = seriesData.get(this.#series.candlestick);

		this.#updateChartInfoPanel(candlestick);
		this.#updateIndicatorPanels(seriesData);
		this.#updateRulerTool({ logical, point, sourceEvent });
	}

	#updateChartInfoPanel(candlestick) {
		this.chartInfoPanel.update(candlestick);
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

	#handleSelectedTradeTime(time) {
		if (!time) return;

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
}
