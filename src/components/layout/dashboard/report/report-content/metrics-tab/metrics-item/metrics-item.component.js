import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './metrics-item.module.css';
import templateHTML from './metrics-item.template.html?raw';

export class MetricsItem extends BaseComponent {
	#$element;

	render() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element);
		return this.element;
	}

	update(metric) {
		const map = {
			title: [metric.title],
			all: metric.all,
			long: metric.long,
			short: metric.short,
		};

		this.#$element.findAll('[data-field]').forEach((el) => {
			const field = el.attr('data-field');
			const [group, indexStr] = field.split('.');
			const index = Number(indexStr);

			const value = map[group][index] ?? '';
			el.html(value);
		});
	}
}
