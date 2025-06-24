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

import {
	candlestickStyleOptions,
	chartOptions,
	lineStyleOptions,
} from '@/config/chart.config';

import { DATA_BATCH_SIZE } from '@/constants/chart.constants';

import { chartService } from '@/api/services/chart.service';

import styles from './chart.module.css';
import templateHTML from './chart.template.html?raw';

import { ChartInfoPanel } from './chart-info-panel/chart-info-panel.component';
import { ScrollToRealtimeButton } from './scroll-to-realtime-button/scroll-to-realtime-button.component';

export class Chart extends BaseComponent {
	#$element;
	#chartApi;

	#currentContextId = null;
	#visibleRange = DATA_BATCH_SIZE;
	#chartData = {
		candlesticks: null,
		indicators: null,
		markers: null,
	};
	#chartSeries = {
		candlesticks: null,
		indicators: new Map(),
		markers: null,
	};
	#dataFields = new Map();

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

		if (this.#currentContextId !== context.id) {
			this.#currentContextId = context.id;

			this.#removeSeries();
			this.#createSeries();
		}

		this.#updateSeries();
		this.#initInfoPanels();
	}

	#initComponents() {
		this.chartInfoPanel = new ChartInfoPanel();
		this.scrollToRealtimeButton = new ScrollToRealtimeButton();
	}

	#initDOM() {
		this.element = renderService.htmlToElement(
			templateHTML,
			[this.chartInfoPanel, this.scrollToRealtimeButton],
			styles,
		);
		this.#$element = $Q(this.element);
	}

	#setupInitialState() {
		this.#chartApi = createChart(this.element, chartOptions);

		this.#chartApi.subscribeCrosshairMove(
			this.#handleCrosshairMove.bind(this),
		);
		this.#chartApi
			.timeScale()
			.subscribeVisibleLogicalRangeChange(
				this.#handleVisibleLogicalRangeChange.bind(this),
			);

		stateService.subscribe('context', this.update.bind(this));
		stateService.set('chartApi', this.#chartApi);

		this.update(stateService.get('context'));
	}

	async #loadData() {
		await Promise.all([
			this.#loadСandlesticks(),
			this.#loadIndicators(),
			this.#loadMarkers(),
		]);
	}

	async #loadСandlesticks() {
		try {
			this.#chartData.candlesticks = await chartService.getKlines(
				stateService.get('context').id,
			);
		} catch (error) {
			console.error('Failed to load candlesticks data:', error);
		}
	}

	async #loadIndicators() {
		try {
			this.#chartData.indicators = await chartService.getIndicators(
				stateService.get('context').id,
			);
		} catch (error) {
			console.error('Failed to load indicators data:', error);
		}
	}

	async #loadMarkers() {
		try {
			this.#chartData.markers = await chartService.getMarkers(
				stateService.get('context').id,
			);
		} catch (error) {
			console.error('Failed to load trade markers:', error);
		}
	}

	#removeSeries() {
		if (this.#chartSeries.candlesticks) {
			this.#chartApi.removeSeries(this.#chartSeries.candlesticks);
		}

		if (this.#chartSeries.indicators.size) {
			this.#chartSeries.indicators.forEach((series) => {
				this.#chartApi.removeSeries(series);
			});
		}

		this.chartSeries = {
			candlesticks: null,
			indicators: new Map(),
			markers: null,
		};

		this.#visibleRange = DATA_BATCH_SIZE;
	}

	#createSeries() {
		this.#createCandlestickSeries();
		this.#createIndicatorSeries();
	}

	#createCandlestickSeries() {
		const context = stateService.get('context');

		this.#chartSeries.candlesticks = this.#chartApi.addSeries(
			CandlestickSeries,
			candlestickStyleOptions,
		);
		this.#chartSeries.candlesticks.applyOptions({
			priceFormat: {
				type: 'price',
				precision: String(context.mintick).split('.')[1]?.length || 0,
				minMove: context.mintick,
			},
		});
	}

	#createIndicatorSeries() {
		const context = stateService.get('context');

		Object.entries(context.indicators).forEach(([key, options]) => {
			const series = this.#chartApi.addSeries(LineSeries);
			series.applyOptions({ ...lineStyleOptions, ...options });
			this.#chartSeries.indicators.set(key, series);
		});
	}

	#updateSeries() {
		this.#updateCandlesticks();
		this.#updateIndicators();
		this.#updateMarkers();
	}

	#updateCandlesticks() {
		this.#chartSeries.candlesticks.setData(
			this.#chartData.candlesticks.slice(-this.#visibleRange),
		);
	}

	#updateIndicators() {
		this.#chartSeries.indicators.forEach((series, key) => {
			const data = this.#chartData.indicators[key];
			series.setData(data.slice(-this.#visibleRange));
		});
	}

	#updateMarkers() {
		if (!this.#chartData.markers) return;

		const startTime = this.#chartSeries.candlesticks.data()[0].time;
		const visibleMarkers = this.#chartData.markers.filter(
			(marker) => marker.time >= startTime,
		);

		if (!this.#chartSeries.markers) {
			this.#chartSeries.markers = createSeriesMarkers(
				this.#chartSeries.candlesticks,
				visibleMarkers,
			);
		} else {
			this.#chartSeries.markers.setMarkers(visibleMarkers);
		}
	}

	#initInfoPanels() {
		const candlestick = this.#chartSeries.candlesticks.data().at(-1);
		this.chartInfoPanel.update(candlestick, true);
	}

	#handleCrosshairMove(param) {
		if (!param.time) {
			return;
		}

		this.chartInfoPanel.update(
			param.seriesData.get(this.#chartSeries.candlesticks),
		);
	}

	#handleVisibleLogicalRangeChange(newRange) {
		if (this.#visibleRange >= this.#chartData.candlesticks.length) return;

		if (newRange.from < 50) {
			this.#visibleRange += DATA_BATCH_SIZE;
			this.#updateSeries();
		}
	}
}
