import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import { DataService } from '@/api/data.service';

import styles from './metrics-tab.module.css';
import templateHTML from './metrics-tab.template.html?raw';

export class MetricsTab extends BaseComponent {
	#$element;

	render() {
		this.testRequest();

		this.element = renderService.htmlToElement(templateHTML, [], styles);

		this.#$element = $Q(this.element);
		return this.element;
	}

	hide() {
		this.#$element.css('display', 'none');
	}

	show() {
		this.#$element.css('display', 'flex');
	}

	testRequest() {
		this.dataService = new DataService();
		this.dataService.getSummary(this.onSuccessSummary.bind(this));
	}

	onSuccessSummary(data) {
		const contextId = Object.keys(data)[0];

		console.log(data, contextId);

		this.dataService.getReportDetails(
			contextId,
			this.onSuccessDetails.bind(this),
		);
	}

	onSuccessDetails(data) {
		console.log(data);
	}
}
