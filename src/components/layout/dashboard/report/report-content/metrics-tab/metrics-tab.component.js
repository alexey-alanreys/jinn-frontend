import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';
import { stateService } from '@/core/services/state.service';

import { dataService } from '@/api/data.service';

import styles from './metrics-tab.module.css';
import templateHTML from './metrics-tab.template.html?raw';

import { MetricsItem } from './metrics-item/metrics-item.component';

export class MetricsTab extends BaseComponent {
	#$element;
	#itemsMap = new Map();

	render() {
		this.#initDOM();
		this.#setupInitialState();

		return this.element;
	}

	async update() {
		try {
			const contextId = stateService.get('contextId');
			const metrics = await dataService.getReportMetrics(contextId);
			const container = this.#$element.find('[data-ref="metrics-items"]');

			metrics.forEach((metric, index) => {
				let item = this.#itemsMap.get(index);

				if (!item) {
					item = new MetricsItem();
					this.#itemsMap.set(index, item);
					container.append(item.render());
				}

				item.update(metric);
			});
		} catch (error) {
			console.error('Failed to update metrics:', error);
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
		stateService.subscribe('contextId', this.update.bind(this));
		stateService.subscribe('summary', this.update.bind(this));

		this.update();
	}
}
