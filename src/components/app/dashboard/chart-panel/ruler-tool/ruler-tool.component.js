import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';
import { stateService } from '@/core/services/state.service';

import { STATE_KEYS } from '@/constants/state-keys.constants';

import styles from './ruler-tool.module.css';
import templateHTML from './ruler-tool.template.html?raw';

export class RulerTool extends BaseComponent {
	static COMPONENT_NAME = 'RulerTool';

	#$element;
	#$lineX;
	#$lineY;
	#chartClickHandler;

	#minMove = null;
	#precision = null;
	#isMeasuring = false;

	#dataFields = new Map();
	#startParams = {
		chartX: null,
		chartY: null,
		localX: null,
		localY: null,
	};

	render() {
		this.#initDOM();
		this.#setupInitialState();
		return this.element;
	}

	update({ logical, point, sourceEvent, candlestickSeries }) {
		if (!this.#isMeasuring) return;

		this.#updateSize({
			localX: sourceEvent.localX,
			localY: sourceEvent.localY,
		});

		this.#updateInfo({
			chartX: logical,
			chartY: candlestickSeries.coordinateToPrice(point.y),
		});
	}

	initialize() {
		if (this.#isActive) return;

		this.#subscribeToChart();
	}

	deactivate() {
		this.#unsubscribeFromChart();
		this.#$element.data('active', 'false');
		this.#isMeasuring = false;
	}

	get #isActive() {
		return this.#$element.is('data-active');
	}

	#initDOM() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element);
		this.#$lineX = this.#$element.find('[data-ref="lineX"]');
		this.#$lineY = this.#$element.find('[data-ref="lineY"]');
	}

	#setupInitialState() {
		this.#chartClickHandler = this.#handleChartClick.bind(this);

		this.#$element.findAll('[data-field]').forEach((el) => {
			const fieldKey = el.data('field');
			this.#dataFields.set(fieldKey, el);
		});

		stateService.subscribe(STATE_KEYS.CONTEXT, this.#finish.bind(this));
	}

	#activate() {
		if (this.#isActive) return;

		this.#$element.data('active', 'true');
		this.#isMeasuring = true;
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

	#handleChartClick({ logical, point, sourceEvent }) {
		if (this.#isActive) {
			this.#finish();
			return;
		}

		const candlestickSeries = stateService.get(STATE_KEYS.CANDLE_SERIES);
		if (!candlestickSeries) return;

		this.#prepare({ logical, point, sourceEvent, candlestickSeries });
	}

	#finish() {
		if (this.#isActive) {
			stateService.set(STATE_KEYS.RULER_ACTIVE, false);
		}
	}

	#prepare({ logical, point, sourceEvent, candlestickSeries }) {
		const { minMove, precision } = stateService.get(STATE_KEYS.CONTEXT);
		this.#minMove = minMove;
		this.#precision = precision;

		this.#startParams = {
			chartX: logical,
			chartY: candlestickSeries.coordinateToPrice(point.y),
			localX: sourceEvent.localX,
			localY: sourceEvent.localY,
		};

		this.#setupRuler();
		this.#activate();
	}

	#setupRuler() {
		const initialValues = {
			'price-abs': this.#formatPriceAbs(this.#startParams.chartY),
			'price-pct': this.#formatPricePct(this.#startParams.chartY),
			'price-ticks': this.#formatPriceTicks(this.#startParams.chartY),
			'bar-distance': this.#formatBarDistance(this.#startParams.chartX),
		};

		this.#dataFields.forEach((element, fieldKey) => {
			element.text(initialValues[fieldKey]);
		});

		this.#$element.data('trend', 'up');
		this.#$lineX.data('direction', 'right');
		this.#$lineY.data('direction', 'up');

		this.#$element
			.css('left', `${this.#startParams.localX}px`)
			.css('top', `${this.#startParams.localY}px`)
			.css('width', '0px')
			.css('height', '0px');
	}

	#updateSize({ localX, localY }) {
		const width = localX - this.#startParams.localX;
		const height = this.#startParams.localY - localY;

		if (width >= 0) {
			if (this.#$lineX.data('direction') === 'left') {
				this.#$lineX.data('direction', 'right');
			}

			this.#$element.css('width', `${width}px`);
		} else {
			if (this.#$lineX.data('direction') === 'right') {
				this.#$lineX.data('direction', 'left');
			}

			this.#$element
				.css('left', `${localX}px`)
				.css('width', `${Math.abs(width)}px`);
		}

		if (height >= 0) {
			if (this.#$element.data('trend') === 'down') {
				this.#$element.data('trend', 'up');
				this.#$lineY.data('direction', 'up');
			}

			this.#$element.css('top', `${localY}px`).css('height', `${height}px`);
		} else {
			if (this.#$element.data('trend') === 'up') {
				this.#$element.data('trend', 'down');
				this.#$lineY.data('direction', 'down');
			}

			this.#$element.css('height', `${Math.abs(height)}px`);
		}
	}

	#updateInfo({ chartX, chartY }) {
		const newValues = {
			'price-abs': this.#formatPriceAbs(chartY),
			'price-pct': this.#formatPricePct(chartY),
			'price-ticks': this.#formatPriceTicks(chartY),
			'bar-distance': this.#formatBarDistance(chartX),
		};

		this.#dataFields.forEach((element, fieldKey) => {
			element.text(newValues[fieldKey]);
		});
	}

	#formatPriceAbs(chartY) {
		const priceAbs = chartY - this.#startParams.chartY;
		return priceAbs.toFixed(this.#precision);
	}

	#formatPricePct(chartY) {
		const pricePct = (chartY / this.#startParams.chartY - 1) * 100;
		return `(${pricePct.toFixed(2)}%)`;
	}

	#formatPriceTicks(chartY) {
		const priceAbs = chartY - this.#startParams.chartY;
		const priceTicks = priceAbs / this.#minMove;
		return priceTicks.toFixed(0);
	}

	#formatBarDistance(chartX) {
		const barDistance = chartX - this.#startParams.chartX;
		return `${barDistance.toFixed(0)} bars`;
	}
}
