import { BaseComponent } from '@/core/component/base.component';
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
		this.buttons = {
			overview: new OverviewTabButton(),
			performance: new PerformanceTabButton(),
			trades: new TradesTabButton(),
		};

		this.element = renderService.htmlToElement(
			templateHTML,
			[
				this.buttons.overview,
				this.buttons.performance,
				this.buttons.trades,
				this.props.toggleVisibilityButton,
				this.props.toggleExpansionButton,
			],
			styles,
		);

		this.#$element = $Q(this.element);
		return this.element;
	}

	connectButtons(onTabChange) {
		Object.entries(this.buttons).forEach(([name, button]) => {
			button.setOnClick(() => {
				this.#setActiveOnly(name);
				onTabChange?.(name);
			});
		});
	}

	#setActiveOnly(buttonName) {
		for (const [name, button] of Object.entries(this.buttons)) {
			name === buttonName ? button.activate() : button.deactivate();
		}
	}

	getMinHeight() {
		return parseInt(this.#$element.css('min-height'));
	}
}
