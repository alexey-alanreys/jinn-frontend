import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import { ALERT_COLORS } from '@/constants/alerts.constants';

import styles from './alerts-item.module.css';
import templateHTML from './alerts-item.template.html?raw';

export class AlertsItem extends BaseComponent {
	static COMPONENT_NAME = 'AlertsItem';

	#$element;
	#dataFields = new Map();

	render() {
		this.#initDOM();
		this.#setupInitialState();

		return this.element;
	}

	remove() {
		this.element.remove();
	}

	update(alertId, alert) {
		this.#dataFields.forEach(({ element }, key) => {
			this.#$element.data('context-id', alert.context);
			this.#$element.data('alert-id', alertId);

			const value = alert[key];
			element.text(value);

			if (ALERT_COLORS[key]) {
				const colorClass = styles[ALERT_COLORS[key][value]];

				if (colorClass) {
					element.addClass(colorClass);
				}
			}
		});
	}

	#initDOM() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element);
	}

	#setupInitialState() {
		this.#$element.findAll('[data-field]').forEach((el) => {
			const key = el.data('field');
			this.#dataFields.set(key, { element: el });
		});
	}
}
