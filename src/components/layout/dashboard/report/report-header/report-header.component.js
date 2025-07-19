import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './report-header.module.css';
import templateHTML from './report-header.template.html?raw';

import { OverviewMetricsTabButton } from './overview-metrics-tab-button/overview-metrics-tab-button.component';
import { PerformanceMetricsTabButton } from './performance-metrics-tab-button/performance-metrics-tab-button.component';
import { TradesTabButton } from './trades-tab-button/trades-tab-button.component';

export class ReportHeader extends BaseComponent {
	static COMPONENT_NAME = 'ReportHeader';

	#$element;

	constructor({ toggleVisibilityButton, toggleExpansionButton }) {
		super();

		this.toggleVisibilityButton = toggleVisibilityButton;
		this.toggleExpansionButton = toggleExpansionButton;
	}

	render() {
		this.#initComponents();
		this.#initDOM();

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

	get minHeight() {
		return parseInt(this.#$element.css('min-height'));
	}

	#initComponents() {
		this.buttons = {
			overview: new OverviewMetricsTabButton(),
			metrics: new PerformanceMetricsTabButton(),
			trades: new TradesTabButton(),
		};
	}

	#initDOM() {
		this.element = renderService.htmlToElement(
			templateHTML,
			[
				this.buttons.overview,
				this.buttons.metrics,
				this.buttons.trades,
				this.toggleVisibilityButton,
				this.toggleExpansionButton,
			],
			styles,
		);
		this.#$element = $Q(this.element);
	}

	#setActiveOnly(buttonName) {
		for (const [name, button] of Object.entries(this.buttons)) {
			name === buttonName ? button.activate() : button.deactivate();
		}
	}
}
