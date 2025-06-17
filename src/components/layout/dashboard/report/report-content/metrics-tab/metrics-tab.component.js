import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './metrics-tab.module.css';
import templateHTML from './metrics-tab.template.html?raw';

import { MetricsItem } from './metrics-item/metrics-item.component';

export class MetricsTab extends BaseComponent {
	#$element;
	#itemsMap = new Map();

	render() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element);
		return this.element;
	}

	update(metrics) {
		const list = this.#$element.find('[data-ref="metrics-items"]');

		metrics.forEach((metric, key) => {
			let item = this.#itemsMap.get(key);

			if (!item) {
				item = new MetricsItem();
				this.#itemsMap.set(key, item);
				list.append(item.render());
			}

			item.update(metric);
		});
	}

	hide() {
		this.#$element.css('display', 'none');
	}

	show() {
		this.#$element.css('display', 'flex');
	}
}
