import {
	CandlestickSeries,
	LineSeries,
	createChart,
} from 'lightweight-charts';

import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import { candlestickOptions, chartOptions } from '@/config/chart.config';

import { dataService } from '@/api/data.service';

import styles from './chart.module.css';
import templateHTML from './chart.template.html?raw';

export class Chart extends BaseComponent {
	#$element;

	#chart;
	#timeScale;
	#candlestickSeries;
	#indicatorSeriesGroup = new Map();

	render() {
		this.#initComponents();
		this.#initDOM();

		// this.requestToTest();
		return this.element;
	}

	set height(height) {
		this.#$element.css('bottom', `${height}px`);
	}

	// async requestToTest() {
	// 	try {
	// 		const summary = await dataService.getSummary();
	// 		const contextId = Object.keys(summary)[0];
	// 		const chartData = await dataService.getChartDetails(contextId);
	// 	} catch (error) {
	// 		console.error('Failed to load chart data:', error);
	// 	}
	// }

	#initComponents() {}

	#initDOM() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element);

		this.#chart = createChart(this.element, chartOptions);
		this.#timeScale = this.#chart.timeScale();

		this.#candlestickSeries = this.#chart.addSeries(
			CandlestickSeries,
			candlestickOptions,
		);
	}
}
