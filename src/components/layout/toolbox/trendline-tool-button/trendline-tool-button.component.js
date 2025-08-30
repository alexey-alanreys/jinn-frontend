import { LineSeries } from 'lightweight-charts';

import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { drawingsService } from '@/core/services/drawings.service';
import { notificationService } from '@/core/services/notification.service';
import { renderService } from '@/core/services/render.service';
import { stateService } from '@/core/services/state.service';

import { STATE_KEYS } from '@/constants/state-keys.constants';
import { TRENDLINE_OPTIONS } from '@/constants/trendline-tool.constants';

import styles from './trendline-tool-button.module.css';
import templateHTML from './trendline-tool-button.template.html?raw';

export class TrendlineToolButton extends BaseComponent {
	static COMPONENT_NAME = 'TrendlineToolButton';

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
		if (!this.#isActive) return;

		this.#$element.data('active', 'false');
		this.element.blur();
		this.#selectedPoints = [];
		this.#unsubscribeFromChart();
	}

	get #isActive() {
		return this.#$element.is('data-active');
	}

	#initDOM() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element);
	}

	#setupInitialState() {
		this.#$element.on('click', this.#handleClick.bind(this));
		this.#chartClickHandler = this.#handleChartClick.bind(this);

		stateService.subscribe(
			STATE_KEYS.CANDLE_SERIES,
			this.deactivate.bind(this),
		);
	}

	#handleClick() {
		if (this.#isActive) {
			this.deactivate();
		} else {
			this.#activate();
			this.onActivate?.();
		}
	}

	#activate() {
		this.#$element.data('active', 'true');
		this.#subscribeToChart();
		notificationService.show('info', 'Select two points on the chart');
	}

	#subscribeToChart() {
		const chartApi = stateService.get(STATE_KEYS.CHART_API);
		if (!chartApi) return;

		chartApi.subscribeClick(this.#chartClickHandler);
	}

	#unsubscribeFromChart() {
		const chartApi = stateService.get(STATE_KEYS.CHART_API);
		if (!chartApi) return;

		chartApi.unsubscribeClick(this.#chartClickHandler);
	}

	#handleChartClick({ time, point }) {
		const chartApi = stateService.get(STATE_KEYS.CHART_API);
		const candlestickSeries = stateService.get(STATE_KEYS.CANDLE_SERIES);

		if (!chartApi || !candlestickSeries) return;

		const x = time;
		const y = candlestickSeries.coordinateToPrice(point.y);

		if (!x) {
			notificationService.show(
				'warning',
				'Cannot draw a line outside the chart area',
			);
			this.deactivate();
			return;
		}

		if (!this.#selectedPoints.length) {
			this.#selectedPoints.push({ time: x, value: y });
			return;
		}

		if (x === this.#selectedPoints[0].time) {
			notificationService.show('warning', 'Cannot draw a vertical line');
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

		drawingsService.add('trendlines', this.#selectedPoints);

		this.deactivate();
	}
}
