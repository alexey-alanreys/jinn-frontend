import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';
import { stateService } from '@/core/services/state.service';

import { reportService } from '@/api/services/report.service';

import styles from './overview-tab.module.css';
import templateHTML from './overview-tab.template.html?raw';

import { EquityCurve } from './equity-curve/equity-curve.component';
import { OverviewEmpty } from './overview-empty/overview-empty.component';
import { OverviewMetrics } from './overview-metrics/overview-metrics.component';

export class OverviewTab extends BaseComponent {
	#$element;

	render() {
		this.#initComponents();
		this.#initDOM();
		this.#setupInitialState();

		return this.element;
	}

	async update(context) {
		try {
			const metrics = await reportService.getOverviewMetrics(context.id);
			const equity = await reportService.getOverviewEquity(context.id);

			if (!equity.length) {
				if (!this.overviewEmpty.isActive) {
					this.overviewMetrics.hide();
					this.equityCurve.hide();

					this.overviewEmpty.show();
				}
				return;
			}

			if (!this.overviewEmpty.isActive) {
				this.overviewMetrics.show();
				this.equityCurve.show();
			} else {
				this.overviewEmpty.hide();

				this.overviewMetrics.show();
				this.equityCurve.show();
			}

			this.overviewMetrics.update(metrics);
			this.equityCurve.update(equity);
		} catch (error) {
			console.error('Failed to update overview.', error);
		}
	}

	hide() {
		this.#$element.css('display', 'none');
	}

	show() {
		this.#$element.css('display', 'flex');
	}

	#initComponents() {
		this.overviewMetrics = new OverviewMetrics();
		this.equityCurve = new EquityCurve();
		this.overviewEmpty = new OverviewEmpty();
	}

	#initDOM() {
		this.element = renderService.htmlToElement(
			templateHTML,
			[this.overviewMetrics, this.equityCurve, this.overviewEmpty],
			styles,
		);
		this.#$element = $Q(this.element);
	}

	#setupInitialState() {
		stateService.subscribe('context', this.update.bind(this));
		this.update(stateService.get('context'));
	}
}
