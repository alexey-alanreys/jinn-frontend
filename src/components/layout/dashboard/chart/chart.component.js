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

import { INITIAL_VISIBLE_RANGE } from '@/constants/chart.constants';

import { chartService } from '@/api/services/chart.service';

import styles from './chart.module.css';
import templateHTML from './chart.template.html?raw';

export class Chart extends BaseComponent {
	#$element;
	#contextId;
	#chart;
	#chartData = {};
	#chartSeries = {};
	#boundVisibleRangeChangeHandler;
	#visibleRange = INITIAL_VISIBLE_RANGE;

	render() {
		this.#initDOM();
		this.#setupInitialState();

		return this.element;
	}

	set height(height) {
		this.#$element.css('bottom', `${height}px`);
	}

	async update() {
		try {
			if (this.#contextId !== stateService.get('contextId')) {
				await this.#loadAllData();

				if (this.#contextId !== undefined) {
					this.#removeSeries();
				}

				this.#contextId = stateService.get('contextId');
				this.#createAllSeries();
				this.#updateAllSeries();
			} else {
				await Promise.all([this.#loadIndicators(), this.#loadMarkers()]);

				this.#updateIndicators();
				this.#updateMarkers();
			}
		} catch (error) {
			console.error('Failed to update chart data:', error);
		}
	}

	#initDOM() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element);
	}

	#setupInitialState() {
		this.#createChart();
		this.#createAllSeries();
		this.#addEventListeners();

		this.update();
	}

	#createChart() {
		this.#chart = createChart(this.element, chartOptions);
		stateService.set('iChartApi', this.#chart);
	}

	#createAllSeries() {
		this.#createCandlestickSeries();
		this.#createIndicatorSeries();
	}

	#createCandlestickSeries() {
		const contextId = stateService.get('contextId');
		const context = stateService.get('contexts')[contextId];

		this.#chartSeries.candlesticks = this.#chart.addSeries(
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
		const contextId = stateService.get('contextId');
		const context = stateService.get('contexts')[contextId];

		this.#chartSeries.indicators = new Map();

		Object.entries(context.indicators).forEach(([key, options]) => {
			const series = this.#chart.addSeries(LineSeries);
			series.applyOptions({ ...lineStyleOptions, ...options });
			this.#chartSeries.indicators.set(key, series);
		});
	}

	#addEventListeners() {
		this.#boundVisibleRangeChangeHandler =
			this.#handleVisibleLogicalRangeChange.bind(this);
		this.#chart
			.timeScale()
			.subscribeVisibleLogicalRangeChange(
				this.#boundVisibleRangeChangeHandler,
			);

		stateService.subscribe('contextId', this.update.bind(this));
		stateService.subscribe('contexts', this.update.bind(this));
	}

	async #loadAllData() {
		await Promise.all([
			this.#loadСandlesticks(),
			this.#loadIndicators(),
			this.#loadMarkers(),
		]);
	}
	async #loadСandlesticks() {
		try {
			this.#chartData.candlesticks = await chartService.getKlines(
				stateService.get('contextId'),
			);
		} catch (error) {
			console.error('Failed to load candlesticks data:', error);
		}
	}

	async #loadIndicators() {
		try {
			this.#chartData.indicators = await chartService.getIndicators(
				stateService.get('contextId'),
			);
		} catch (error) {
			console.error('Failed to load indicators data:', error);
		}
	}

	async #loadMarkers() {
		try {
			this.#chartData.markers = await chartService.getMarkers(
				stateService.get('contextId'),
			);
		} catch (error) {
			console.error('Failed to load trade markers:', error);
		}
	}

	#removeSeries() {
		this.#chart.removeSeries(this.#chartSeries.candlesticks);
		this.#chartSeries.candlesticks = null;

		this.#chartSeries.indicators.forEach((series) =>
			this.#chart.removeSeries(series),
		);
		this.#chartSeries.indicators.clear();

		this.#chartSeries.markers = null;
	}

	#updateAllSeries() {
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
			const values = this.#chartData.indicators[key];
			series.setData(values.slice(-this.#visibleRange));
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

	#handleVisibleLogicalRangeChange(newRange) {
		if (this.#visibleRange >= this.#chartData.candlesticks.length) {
			this.#chart
				.timeScale()
				.unsubscribeVisibleLogicalRangeChange(
					this.#boundVisibleRangeChangeHandler,
				);
		}

		if (newRange.from < 50) {
			this.#visibleRange += INITIAL_VISIBLE_RANGE;
			this.#updateAllSeries();
		}
	}
}
