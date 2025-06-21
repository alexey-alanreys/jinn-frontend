import { BaseComponent } from '@/core/component/base.component';
import { renderService } from '@/core/services/render.service';

import { dataService } from '@/api/data.service';

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

		this.requestToTest();
		return this.element;
	}

	showOnly(tabName) {
		for (const [name, tab] of Object.entries(this.tabs)) {
			name === tabName ? tab.show() : tab.hide();
		}
	}

	async requestToTest() {
		try {
			const data = await dataService.getSummary();
			const contextId = Object.keys(data)[0];

			await Promise.all([
				this.tabs.overview.update(contextId),
				this.tabs.metrics.update(contextId),
				this.tabs.trades.update(contextId),
			]);
		} catch (error) {
			console.error('Failed to load report data:', error);
		}
	}
}
