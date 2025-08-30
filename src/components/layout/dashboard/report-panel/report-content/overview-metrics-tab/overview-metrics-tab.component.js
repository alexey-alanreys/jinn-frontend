import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';
import { stateService } from '@/core/services/state.service';

import { NoData } from '@/components/ui/no-data/no-data.component';
import { Spinner } from '@/components/ui/spinner/spinner.component';

import { STATE_KEYS } from '@/constants/state-keys.constants';

import { reportService } from '@/api/services/report.service';

import styles from './overview-metrics-tab.module.css';
import templateHTML from './overview-metrics-tab.template.html?raw';

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
			let metrics = { primary: [], equity: [] };
			if (context.id) {
				try {
					metrics = await reportService.getOverviewMetrics(context.id);
				} catch {
					metrics = { primary: [], equity: [] };
				}
			}

			this.overviewMetrics.update(metrics.primary);
			this.equityCurve.update(metrics.equity);

			if (metrics.equity.length) {
				this.noData.hide();
			} else {
				this.noData.show();
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
		this.noData = new NoData();
		this.overviewMetrics = new OverviewMetrics();
		this.equityCurve = new EquityCurve();
	}

	#initDOM() {
		this.element = renderService.htmlToElement(
			templateHTML,
			[this.spinner, this.noData, this.overviewMetrics, this.equityCurve],
			styles,
		);
		this.#$element = $Q(this.element);
	}

	#setupInitialState() {
		stateService.subscribe(STATE_KEYS.CONTEXT, this.update.bind(this));
		this.update(stateService.get(STATE_KEYS.CONTEXT));
	}
}
