import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';
import { stateService } from '@/core/services/state.service';

import { MetricsItem } from '@/components/ui/report-content/metrics-item/metrics-item.component';

import { STATE_KEYS } from '@/constants/state-keys.constants';

import { reportService } from '@/api/services/report.service';

import styles from './trade-metrics-tab.module.css';
import templateHTML from './trade-metrics-tab.template.html?raw';

export class TradeMetricsTab extends BaseComponent {
	static COMPONENT_NAME = 'TradeMetricsTab';

	#$element;
	#items = new Map();

	render() {
		this.#initDOM();
		this.#setupInitialState();

		return this.element;
	}

	async update(context) {
		try {
			let metrics = [];
			if (context.id) {
				try {
					metrics = await reportService.getTradeMetrics(context.id);
				} catch {
					metrics = [];
				}
			}

			this.#renderMetrics(metrics);
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
		stateService.subscribe(STATE_KEYS.CONTEXT, this.update.bind(this));
		this.update(stateService.get(STATE_KEYS.CONTEXT));
	}

	#renderMetrics(metrics) {
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
	}
}
