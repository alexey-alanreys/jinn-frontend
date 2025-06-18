import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './metrics-item.module.css';
import templateHTML from './metrics-item.template.html?raw';

export class MetricsItem extends BaseComponent {
	#$element;
	#dataFields = new Map();

	render() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element);

		this.#$element.findAll('[data-field]').forEach((el) => {
			const fieldKey = el.data('field');
			const [group, index] = fieldKey.split('.');

			this.#dataFields.set(fieldKey, {
				element: el,
				group,
				index: Number(index),
			});
		});

		return this.element;
	}

	update(metric) {
		this.#dataFields.forEach(({ element, group, index }) => {
			element.html(metric[group][index]);
		});
	}
}
