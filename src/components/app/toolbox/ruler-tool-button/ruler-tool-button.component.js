import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { notificationService } from '@/core/services/notification.service';
import { renderService } from '@/core/services/render.service';
import { stateService } from '@/core/services/state.service';

import { STATE_KEYS } from '@/constants/state-keys.constants';

import styles from './ruler-tool-button.module.css';
import templateHTML from './ruler-tool-button.template.html?raw';

export class RulerToolButton extends BaseComponent {
	static COMPONENT_NAME = 'RulerToolButton';

	#$element;

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
		const rulerTool = stateService.get(STATE_KEYS.RULER_TOOL);
		if (!this.#isActive || !rulerTool) return;

		this.#$element.data('active', 'false');
		this.element.blur();
		rulerTool.deactivate();
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

		stateService.subscribe(
			STATE_KEYS.RULER_ACTIVE,
			this.#handleRulerActiveChange.bind(this),
		);
	}

	#handleClick() {
		if (this.#isActive) {
			this.deactivate();
		} else {
			const chartApi = stateService.get(STATE_KEYS.CHART_API);
			const candlestickSeries = stateService.get(STATE_KEYS.CANDLE_SERIES);

			if (!chartApi || !candlestickSeries) {
				notificationService.show('warning', 'No chart data available');
				return;
			}

			this.#activate();
			this.onActivate?.();
		}
	}

	#handleRulerActiveChange(rulerActive) {
		if (!rulerActive) {
			this.deactivate();
		}
	}

	#activate() {
		const rulerTool = stateService.get(STATE_KEYS.RULER_TOOL);
		if (!rulerTool) return;

		this.#$element.data('active', 'true');
		rulerTool.initialize();
	}
}
