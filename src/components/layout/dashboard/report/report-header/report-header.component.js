import { BaseComponent } from '@/core/component/base.component.js';
import { renderService } from '@/core/services/render.service';

import styles from './report-header.module.css';
import templateHTML from './report-header.template.html?raw';

import { OverviewTabButton } from './overview-tab-button/overview-tab-button.component';
import { PerformanceTabButton } from './performance-tab-button/performance-tab-button.component';
import { ToggleExpansionButton } from './toggle-expansion-button/toggle-expansion-button.component';
import { ToggleVisibilityButton } from './toggle-visibility-button/toggle-visibility-button.component';
import { TradesTabButton } from './trades-tab-button/trades-tab-button.component';

export class ReportHeader extends BaseComponent {
	render() {
		this.element = renderService.htmlToElement(
			templateHTML,
			[
				OverviewTabButton,
				PerformanceTabButton,
				TradesTabButton,
				ToggleVisibilityButton,
				ToggleExpansionButton,
			],
			styles,
		);
		return this.element;
	}
}
