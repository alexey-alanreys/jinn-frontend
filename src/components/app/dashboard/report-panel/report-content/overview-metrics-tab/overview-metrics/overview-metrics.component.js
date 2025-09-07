import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './overview-metrics.module.css';
import templateHTML from './overview-metrics.template.html?raw';

export class OverviewMetrics extends BaseComponent {
	static COMPONENT_NAME = 'OverviewMetrics';
	static #PROFIT_FIELDS = [0, 1, 5, 6];

	#$element = null;
	#dataFields = new Map();

	render() {
		this.#initDOM();
		this.#setupInitialState();
		return this.element;
	}

	update(metrics) {
		this.#dataFields.forEach(({ element, isProfitField }, index) => {
			const value = metrics[index];
			element.text(value);

			if (isProfitField) {
				this.#applyColorClass(element, value);
			}
		});
	}

	#initDOM() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element);
	}

	#setupInitialState() {
		this.#$element.findAll('[data-field]').forEach((el) => {
			const index = Number(el.data('field'));
			const isProfitField = this.#isProfitField(index);
			this.#dataFields.set(index, { element: el, isProfitField });
		});
	}

	#isProfitField(index) {
		return OverviewMetrics.#PROFIT_FIELDS.includes(index);
	}

	#applyColorClass(element, value) {
		if (value.startsWith('-')) {
			element.removeClass(styles.green).addClass(styles.red);
		} else {
			element.removeClass(styles.red).addClass(styles.green);
		}
	}
}
