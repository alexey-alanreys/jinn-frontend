import {
	CandlestickSeries,
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
	#$element;
	#chartApi;

	#firstLoadDone = false;
	#contextId = null;
	#data = {
		candlesticks: null,
		indicators: null,
		markers: null,
	};
	#series = {
		candlestick: null,
		indicators: new Map(),
		markers: null,
	};
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

			this.#removeSeries();
			this.#createSeries();
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
		this.indicatorsInfoPanel = new IndicatorsInfoPanel();
		this.scrollToRealtimeButton = new ScrollToRealtimeButton();
	}

	#initDOM() {
		this.element = renderService.htmlToElement(
			templateHTML,
			[
				this.spinner,
				this.rulerTool,
				this.chartInfoPanel,
				this.indicatorsInfoPanel,
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
				this.#loadMarkers(),
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

	async #loadMarkers() {
		this.#data.markers = await chartService.getMarkers(
			stateService.get('context').id,
		);
	}

	#removeSeries() {
		const { candlestick, indicators } = this.#series;

		if (candlestick) {
			this.#chartApi.removeSeries(candlestick);
			this.#series.candlestick = null;
		}

		indicators.forEach((series) => this.#chartApi.removeSeries(series));
		this.#series.indicators.clear();

		this.#series.markers = null;

		const drawings = stateService.get('drawings');
		drawings.forEach((series) => this.#chartApi.removeSeries(series));
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

		Object.keys(indicatorOptions).forEach((key) => {
			const series = this.#chartApi.addSeries(LineSeries);
			this.#series.indicators.set(key, series);
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
		this.#updateMarkers();
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

	#updateMarkers() {
		if (!this.#data.markers) return;

		const startTime = this.#series.candlestick.data()[0].time;
		const visibleMarkers = this.#data.markers.filter(
			(marker) => marker.time >= startTime,
		);

		if (!this.#series.markers) {
			this.#series.markers = createSeriesMarkers(
				this.#series.candlestick,
				visibleMarkers,
			);
		} else {
			this.#series.markers.setMarkers(visibleMarkers);
		}
	}

	#resetInfoPanels() {
		const candlestick = this.#series.candlestick.data().at(-1);

		const indicators = Object.fromEntries(
			Array.from(this.#series.indicators, ([key, series]) => [
				key,
				series.data().at(-1),
			]),
		);

		this.chartInfoPanel.update(candlestick, true);
		this.indicatorsInfoPanel.update(indicators, true);
	}

	#handleCrosshairMove({ logical, point, seriesData, sourceEvent, time }) {
		if (!point || !time) return;

		const candlestick = seriesData.get(this.#series.candlestick);
		const indicators = Object.fromEntries(
			[...this.#series.indicators].map(([key, series]) => [
				key,
				seriesData.get(series),
			]),
		);

		this.chartInfoPanel.update(candlestick);
		this.indicatorsInfoPanel.update(indicators);
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
