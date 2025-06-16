import { BaseComponent } from '@/core/component/base.component.js';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './report-header.module.css';
import templateHTML from './report-header.template.html?raw';

import { OverviewTabButton } from './overview-tab-button/overview-tab-button.component';
import { PerformanceTabButton } from './performance-tab-button/performance-tab-button.component';
import { TradesTabButton } from './trades-tab-button/trades-tab-button.component';

export class ReportHeader extends BaseComponent {
	#$element;

	render() {
		const { toggleVisibilityButton, toggleExpansionButton } = this.props;

		this.element = renderService.htmlToElement(
			templateHTML,
			[
				OverviewTabButton,
				PerformanceTabButton,
				TradesTabButton,
				toggleVisibilityButton,
				toggleExpansionButton,
			],
			styles,
		);

		this.#$element = $Q(this.element);
		return this.element;
	}

	getMinHeight() {
		return parseInt(this.#$element.css('min-height'));
	}
}
