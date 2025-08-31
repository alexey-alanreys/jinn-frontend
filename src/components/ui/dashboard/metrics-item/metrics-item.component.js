import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './metrics-item.module.css';
import templateHTML from './metrics-item.template.html?raw';

export class MetricsItem extends BaseComponent {
	static COMPONENT_NAME = 'MetricsItem';

	#$element;
	#dataFields = new Map();

	render() {
		this.#initDOM();
		this.#setupInitialState();

		return this.element;
	}

	update(metric) {
		this.#dataFields.forEach(({ element, group, index }) => {
			element.text(metric[group][index]);
		});
	}

	#initDOM() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element);
	}

	#setupInitialState() {
		this.#$element.findAll('[data-field]').forEach((el) => {
			const key = el.data('field');
			const [group, index] = key.split('.');

			this.#dataFields.set(key, {
				element: el,
				group,
				index: Number(index),
			});
		});
	}
}
