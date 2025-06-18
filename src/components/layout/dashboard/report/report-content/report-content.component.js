import { BaseComponent } from '@/core/component/base.component';
import { renderService } from '@/core/services/render.service';

import { DataService } from '@/api/data.service';

import styles from './report-content.module.css';
import templateHTML from './report-content.template.html?raw';

import { MetricsTab } from './metrics-tab/metrics-tab.component';
import { OverviewTab } from './overview-tab/overview-tab.component';
import { TradesTab } from './trades-tab/trades-tab.component';

export class ReportContent extends BaseComponent {
	render() {
		this.tabs = {
			overview: new OverviewTab(),
			metrics: new MetricsTab(),
			trades: new TradesTab(),
		};

		this.element = renderService.htmlToElement(
			templateHTML,
			[this.tabs.overview, this.tabs.metrics, this.tabs.trades],
			styles,
		);

		this.testRequest();

		return this.element;
	}

	showOnly(tabName) {
		for (const [name, tab] of Object.entries(this.tabs)) {
			name === tabName ? tab.show() : tab.hide();
		}
	}

	testRequest() {
		this.dataService = new DataService();
		this.dataService.getSummary(this.onSuccessSummary.bind(this));
	}

	onSuccessSummary(data) {
		const contextId = Object.keys(data)[0];

		this.dataService.getReportDetails(
			contextId,
			this.onSuccessDetails.bind(this),
		);
	}

	onSuccessDetails(data) {
		this.tabs.metrics.update(data.metrics);
		this.tabs.trades.update(data.trades);

		// setTimeout(() => {
		// 	this.tabs.trades.update(data.trades.slice(0, 100));
		// }, 5000);
	}
}
