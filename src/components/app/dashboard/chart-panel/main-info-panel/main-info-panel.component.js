import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';
import { stateService } from '@/core/services/state.service';

import { STATE_KEYS } from '@/constants/state-keys.constants';

import styles from './main-info-panel.module.css';
import templateHTML from './main-info-panel.template.html?raw';

export class MainInfoPanel extends BaseComponent {
	static COMPONENT_NAME = 'MainInfoPanel';

	#$element = null;

	#metaFields = new Map();
	#candleFields = new Map();

	render() {
		this.#initDOM();
		this.#setupInitialState();
		return this.element;
	}

	update(candlestick, withMeta = false) {
		if (!candlestick) return;

		if (withMeta) {
			this.#updateMeta();
		}

		this.#updateCandlestick(candlestick);
	}

	#initDOM() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element);
	}

	#setupInitialState() {
		const $metaFields = this.#$element
			.find('[data-ref="meta"]')
			.findAll('[data-field]');

		const $candlestickFields = this.#$element
			.find('[data-ref="candlestick"]')
			.findAll('[data-field]');

		$metaFields.forEach((el) => {
			const fieldKey = el.data('field');
			this.#metaFields.set(fieldKey, el);
		});

		$candlestickFields.forEach((el) => {
			const fieldKey = el.data('field');
			this.#candleFields.set(fieldKey, el);
		});
	}

	#updateMeta() {
		const context = stateService.get(STATE_KEYS.EXECUTION_CONTEXT);

		this.#metaFields.forEach((element, fieldKey) => {
			element.text(context[fieldKey]);
		});
	}

	#updateCandlestick(candlestick) {
		const isBullish = candlestick.close >= candlestick.open;
		const classToAdd = isBullish ? styles.green : styles.red;
		const classToRemove = isBullish ? styles.red : styles.green;

		this.#candleFields.forEach((element, fieldKey) => {
			const currentValue = element.text();
			const newValue = candlestick[fieldKey];

			if (currentValue !== String(newValue)) {
				element.text(newValue);
			}

			if (!element.hasClass(classToAdd)) {
				element.addClass(classToAdd).removeClass(classToRemove);
			}
		});
	}
}
