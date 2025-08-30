import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import { ReportTabButton } from '@/components/ui/report-tab-button/report-tab-button.component';

import styles from './report-header.module.css';
import templateHTML from './report-header.template.html?raw';

export class ReportHeader extends BaseComponent {
	static COMPONENT_NAME = 'ReportHeader';

	#$element;

	constructor({ toggleVisibilityButton, toggleExpansionButton }) {
		super();

		this.toggleVisibilityButton = toggleVisibilityButton;
		this.toggleExpansionButton = toggleExpansionButton;
	}

	get minHeight() {
		return parseInt(this.#$element.css('min-height'));
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

	#initComponents() {
		this.buttons = {
			overviewMetrics: new ReportTabButton({ title: 'Overview' }),
			performanceMetrics: new ReportTabButton({ title: 'Performance' }),
			tradeMetrics: new ReportTabButton({ title: 'Trade Analytics' }),
			riskMetrics: new ReportTabButton({ title: 'Risk & Ratios' }),
			trades: new ReportTabButton({ title: 'Trade Log' }),
		};
	}

	#initDOM() {
		this.element = renderService.htmlToElement(
			templateHTML,
			[this.toggleVisibilityButton, this.toggleExpansionButton],
			styles,
		);
		this.#$element = $Q(this.element);

		const $tabButtons = this.#$element.find('[data-ref="tabButtons"]');
		Object.values(this.buttons).forEach((button) => {
			$tabButtons.append(button.render());
		});

		this.buttons.overviewMetrics.activate();
	}

	#setActiveOnly(buttonName) {
		for (const [name, button] of Object.entries(this.buttons)) {
			name === buttonName ? button.activate() : button.deactivate();
		}
	}
}
