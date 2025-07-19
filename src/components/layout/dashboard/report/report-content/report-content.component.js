import { BaseComponent } from '@/core/component/base.component';
import { renderService } from '@/core/services/render.service';

import styles from './report-content.module.css';
import templateHTML from './report-content.template.html?raw';

import { OverviewMetricsTab } from './overview-metrics-tab/overview-metrics-tab.component';
import { PerformanceMetricsTab } from './performance-metrics-tab/performance-metrics-tab.component';
import { TradesTab } from './trades-tab/trades-tab.component';

export class ReportContent extends BaseComponent {
	static COMPONENT_NAME = 'ReportContent';

	render() {
		this.#initComponents();
		this.#initDOM();

		return this.element;
	}

	showOnly(tabName) {
		Object.entries(this.tabs).forEach(([name, tab]) => {
			name === tabName ? tab.show() : tab.hide();
		});
	}

	#initComponents() {
		this.tabs = {
			overview: new OverviewMetricsTab(),
			performance: new PerformanceMetricsTab(),
			trades: new TradesTab(),
		};
	}

	#initDOM() {
		this.element = renderService.htmlToElement(
			templateHTML,
			[this.tabs.overview, this.tabs.performance, this.tabs.trades],
			styles,
		);
	}
}
