import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';
import { stateService } from '@/core/services/state.service';

import { Spinner } from '@/components/ui/spinner/spinner.component';

import { reportService } from '@/api/services/report.service';

import styles from './overview-metrics-tab.module.css';
import templateHTML from './overview-metrics-tab.template.html?raw';

import { EmptyState } from './empty-state/empty-state.component';
import { EquityCurve } from './equity-curve/equity-curve.component';
import { OverviewMetrics } from './overview-metrics/overview-metrics.component';

export class OverviewMetricsTab extends BaseComponent {
	static COMPONENT_NAME = 'OverviewMetricsTab';

	#$element;
	#firstLoadDone = false;

	render() {
		this.#initComponents();
		this.#initDOM();
		this.#setupInitialState();

		return this.element;
	}

	hide() {
		this.#$element.css('display', 'none');
	}

	show() {
		this.#$element.css('display', 'flex');
	}

	async update(context) {
		try {
			const metrics = await reportService.getOverviewMetrics(context.id);

			this.overviewMetrics.update(metrics.primary);
			this.equityCurve.update(metrics.equity);

			if (metrics.equity.length) {
				this.emptyState.hide();
			} else {
				this.emptyState.show();
			}

			if (!this.#firstLoadDone) {
				this.#firstLoadDone = true;
				this.spinner.hide();
			}
		} catch (error) {
			console.error('Failed to update overview.', error);
		}
	}

	#initComponents() {
		this.spinner = new Spinner();
		this.emptyState = new EmptyState();
		this.overviewMetrics = new OverviewMetrics();
		this.equityCurve = new EquityCurve();
	}

	#initDOM() {
		this.element = renderService.htmlToElement(
			templateHTML,
			[this.spinner, this.emptyState, this.overviewMetrics, this.equityCurve],
			styles,
		);
		this.#$element = $Q(this.element);
	}

	#setupInitialState() {
		stateService.subscribe('context', this.update.bind(this));
		this.update(stateService.get('context'));
	}
}
