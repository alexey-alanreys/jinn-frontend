import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';
import { stateService } from '@/core/services/state.service';

import { reportService } from '@/api/services/report.service';

import styles from './metrics-tab.module.css';
import templateHTML from './metrics-tab.template.html?raw';

import { MetricsItem } from './metrics-item/metrics-item.component';

export class MetricsTab extends BaseComponent {
	static COMPONENT_NAME = 'MetricsTab';

	#$element;
	#items = new Map();

	render() {
		this.#initDOM();
		this.#setupInitialState();

		return this.element;
	}

	async update(context) {
		try {
			const metrics = await reportService.getPerformanceMetrics(context.id);
			const $items = this.#$element.find('[data-ref="metricsItems"]');

			metrics.forEach((metric, index) => {
				let item = this.#items.get(index);

				if (!item) {
					item = new MetricsItem();
					this.#items.set(index, item);
					$items.append(item.render());
				}

				item.update(metric);
			});
		} catch (error) {
			console.error('Failed to update metrics.', error);
		}
	}

	hide() {
		this.#$element.css('display', 'none');
	}

	show() {
		this.#$element.css('display', 'flex');
	}

	#initDOM() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element);
	}

	#setupInitialState() {
		stateService.subscribe('context', this.update.bind(this));
		this.update(stateService.get('context'));
	}
}
