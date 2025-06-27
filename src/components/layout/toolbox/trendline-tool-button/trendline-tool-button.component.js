import { LineSeries } from 'lightweight-charts';

import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { notificationService } from '@/core/services/notification.service';
import { renderService } from '@/core/services/render.service';
import { stateService } from '@/core/services/state.service';
import { storageService } from '@/core/services/storage.service';

import { TRENDLINE_OPTIONS } from '@/constants/trendline-tool.constants';

import styles from './trendline-tool-button.module.css';
import templateHTML from './trendline-tool-button.template.html?raw';

export class TrendlineToolButton extends BaseComponent {
	#$element;
	#chartClickHandler;

	#selectedPoints = [];

	constructor({ onActivate }) {
		super();

		this.onActivate = onActivate;
	}

	render() {
		this.#initDOM();
		this.#setupInitialState();

		return this.element;
	}

	deactivate() {
		if (!this.#isActive()) return;

		this.#$element.data('active', 'false');
		this.element.blur();
		this.#selectedPoints = [];
		this.#unsubscribeFromChart();
	}

	#initDOM() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element);
	}

	#setupInitialState() {
		this.#$element.on('click', this.#handleClick.bind(this));
		this.#chartClickHandler = this.#handleChartClick.bind(this);

		stateService.subscribe('candlestickSeries', this.deactivate.bind(this));
	}

	#handleClick() {
		if (this.#isActive()) {
			this.deactivate();
		} else {
			this.#activate();
			this.onActivate?.();
		}
	}

	#isActive() {
		return this.#$element.is('data-active');
	}

	#activate() {
		this.#$element.data('active', 'true');
		this.#subscribeToChart();
		notificationService.show('info', 'Выберите две точки на графике');
	}

	#subscribeToChart() {
		const chartApi = stateService.get('chartApi');
		if (!chartApi) return;

		chartApi.subscribeClick(this.#chartClickHandler);
	}

	#unsubscribeFromChart() {
		const chartApi = stateService.get('chartApi');
		if (!chartApi) return;

		chartApi.unsubscribeClick(this.#chartClickHandler);
	}

	#handleChartClick({ time, point }) {
		const chartApi = stateService.get('chartApi');
		const candlestickSeries = stateService.get('candlestickSeries');

		if (!chartApi || !candlestickSeries) return;

		const x = time;
		const y = candlestickSeries.coordinateToPrice(point.y);

		if (!x) {
			notificationService.show(
				'warning',
				'Нельзя построить линию за пределами графика',
			);
			this.deactivate();
			return;
		}

		if (!this.#selectedPoints.length) {
			this.#selectedPoints.push({ time: x, value: y });
			return;
		}

		if (x === this.#selectedPoints[0].time) {
			notificationService.show(
				'warning',
				'Нельзя построить вертикальную линию',
			);
			this.deactivate();
			return;
		}

		const newPoint = { time: x, value: y };

		if (x > this.#selectedPoints[0].time) {
			this.#selectedPoints.push(newPoint);
		} else {
			this.#selectedPoints.unshift(newPoint);
		}

		const lineSeries = chartApi.addSeries(LineSeries, TRENDLINE_OPTIONS);
		lineSeries.setData(this.#selectedPoints);

		const drawings = stateService.get('drawings');
		stateService.set('drawings', [lineSeries, ...drawings]);
		this.#saveTrendlineToStorage();
		this.deactivate();
	}

	#saveTrendlineToStorage() {
		const contextId = stateService.get('context').id;
		const drawings = storageService.getItem('drawings') || { trendlines: {} };

		drawings.trendlines[contextId] = [
			this.#selectedPoints,
			...(drawings.trendlines[contextId] || []),
		];

		storageService.setItem('drawings', drawings);
	}
}
