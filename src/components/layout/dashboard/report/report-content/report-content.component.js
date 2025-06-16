import { BaseComponent } from '@/core/component/base.component';
import { renderService } from '@/core/services/render.service';

import styles from './report-content.module.css';
import templateHTML from './report-content.template.html?raw';

import { OverviewTab } from './overview-tab/overview-tab.component';
import { PerformanceTab } from './performance-tab/performance-tab.component';
import { TradesTab } from './trades-tab/trades-tab.component';

export class ReportContent extends BaseComponent {
	render() {
		this.tabs = {
			overview: new OverviewTab(),
			performance: new PerformanceTab(),
			trades: new TradesTab(),
		};

		this.element = renderService.htmlToElement(
			templateHTML,
			[this.tabs.overview, this.tabs.performance, this.tabs.trades],
			styles,
		);
		return this.element;
	}

	showOnly(tabName) {
		for (const [name, tab] of Object.entries(this.tabs)) {
			name === tabName ? tab.show() : tab.hide();
		}
	}
}
