import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';
import { stateService } from '@/core/services/state.service';

import { Spinner } from '@/components/ui/spinner/spinner.component';

import { reportService } from '@/api/services/report.service';

import styles from './overview-tab.module.css';
import templateHTML from './overview-tab.template.html?raw';

import { EmptyState } from './empty-state/empty-state.component';
import { EquityCurve } from './equity-curve/equity-curve.component';
import { OverviewMetrics } from './overview-metrics/overview-metrics.component';

export class OverviewTab extends BaseComponent {
	#$element;
	#firstLoadDone = false;

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

			this.overviewMetrics.update(metrics);
			this.equityCurve.update(equity);

			if (!this.#firstLoadDone) {
				this.#$element.find('[data-ref="spinner"]').css('display', 'none');
				this.#firstLoadDone = true;
			}

			this.#toggleView(!!equity.length);
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

	#toggleView(showMainView) {
		if (showMainView) {
			this.emptyState.hide();
			this.overviewMetrics.show();
			this.equityCurve.show();
		} else {
			this.overviewMetrics.hide();
			this.equityCurve.hide();
			this.emptyState.show();
		}
	}
}
