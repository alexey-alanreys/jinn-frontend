import { BaseComponent } from '@/core/component/base.component.js';
import { renderService } from '@/core/services/render.service';

import styles from './report-header.module.css';
import templateHTML from './report-header.template.html?raw';

import { OverviewTabButton } from './overview-tab-button/overview-tab-button.component';
import { PerformanceTabButton } from './performance-tab-button/performance-tab-button.component';
import { ReportSizeButton } from './report-size-button/report-size-button.component';
import { ReportVisibilityButton } from './report-visibility-button/report-visibility-button.component';
import { TradesTabButton } from './trades-tab-button/trades-tab-button.component';

export class ReportHeader extends BaseComponent {
	render() {
		this.element = renderService.htmlToElement(
			templateHTML,
			[
				OverviewTabButton,
				PerformanceTabButton,
				TradesTabButton,
				ReportVisibilityButton,
				ReportSizeButton,
			],
			styles,
		);
		return this.element;
	}
}
