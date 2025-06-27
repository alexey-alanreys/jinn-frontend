import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';
import { stateService } from '@/core/services/state.service';

import styles from './ruler-tool.module.css';
import templateHTML from './ruler-tool.template.html?raw';

export class RulerTool extends BaseComponent {
	#$element;
	#$lineX;
	#$lineY;
	#chartClickHandler;
	#onFinalize;
	#minMove;
	#precision;

	#dataFields = new Map();
	#startParams = {
		chartX: null,
		chartY: null,
		localX: null,
		localY: null,
	};
	#readyToUpdate = false;

	render() {
		this.#initDOM();
		this.#setupInitialState();

		return this.element;
	}

	update({ logical, point, sourceEvent, candlestickSeries }) {
		if (!this.#readyToUpdate) return;

		this.#updateSize({
			localX: sourceEvent.localX,
			localY: sourceEvent.localY,
		});

		this.#updateInfo({
			chartX: logical,
			chartY: candlestickSeries.coordinateToPrice(point.y),
		});
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
		const priceAbs = chartY - this.#startParams.chartY;
		const pricePct = (chartY / this.#startParams.chartY - 1) * 100;
		const priceTicks = priceAbs / this.#minMove;
		const barDistance = chartX - this.#startParams.chartX;

		const newValues = {
			'price-abs': priceAbs.toFixed(this.#precision),
			'price-pct': `(${pricePct.toFixed(2)}%)`,
			'price-ticks': priceTicks.toFixed(0),
			'bar-distance': `Бары: ${barDistance.toFixed(0)}`,
		};

		this.#dataFields.forEach(({ element }, key) => {
			element.text(newValues[key]);
		});
	}

	deactivate() {
		this.#unsubscribeFromChart();

		if (!this.#isActive()) return;
		this.#$element.data('active', 'false');
		this.#readyToUpdate = false;
	}

	subscribeToChart(onFinalize) {
		const chartApi = stateService.get('chartApi');
		if (!chartApi) return;

		this.#onFinalize = onFinalize;
		chartApi.subscribeClick(this.#chartClickHandler);
	}

	#initDOM() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element);
		this.#$lineX = this.#$element.find('[data-ref="lineX"]');
		this.#$lineY = this.#$element.find('[data-ref="lineY"]');
	}

	#setupInitialState() {
		this.#chartClickHandler = this.#handleChartClick.bind(this);

		const dataFields = this.#$element.findAll('[data-field]');
		dataFields.forEach((el) => {
			const key = el.data('field');
			this.#dataFields.set(key, { element: el });
		});

		stateService.subscribe(
			'candlestickSeries',
			this.#finalizeMeasurement.bind(this),
		);
	}

	#isActive() {
		return this.#$element.is('data-active');
	}

	#activate() {
		this.#$element.data('active', 'true');
	}

	#unsubscribeFromChart() {
		const chartApi = stateService.get('chartApi');
		if (!chartApi) return;

		chartApi.unsubscribeClick(this.#chartClickHandler);
	}

	#handleChartClick({ logical, point, sourceEvent }) {
		if (this.#isActive()) {
			this.#finalizeMeasurement();
			return;
		}

		const candlestickSeries = stateService.get('candlestickSeries');
		if (!candlestickSeries) return;

		this.#startParams.chartX = logical;
		this.#startParams.chartY = candlestickSeries.coordinateToPrice(point.y);
		this.#startParams.localX = sourceEvent.localX;
		this.#startParams.localY = sourceEvent.localY;

		this.#initRuler();
		this.#activate();

		this.#readyToUpdate = true;
	}

	#finalizeMeasurement() {
		this.#onFinalize?.();
	}

	#initRuler() {
		const context = stateService.get('context');
		this.#minMove = context.minMove;
		this.#precision = context.precision;

		const initialValues = {
			'price-abs': `0.${Array(this.#precision).fill('0').join('')}`,
			'price-pct': '(0.00%)',
			'price-ticks': '0',
			'bar-distance': 'Бары: 0',
		};

		this.#dataFields.forEach(({ element }, key) => {
			element.text(initialValues[key]);
		});

		this.#$element
			.css('left', `${this.#startParams.localX}px`)
			.css('top', `${this.#startParams.localY}px`)
			.css('width', '0px')
			.css('height', '0px');
	}
}
