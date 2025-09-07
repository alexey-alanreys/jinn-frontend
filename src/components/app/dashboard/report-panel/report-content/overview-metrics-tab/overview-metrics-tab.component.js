import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';
import { stateService } from '@/core/services/state.service';

import { NoData } from '@/components/ui/dashboard/no-data/no-data.component';
import { Spinner } from '@/components/ui/dashboard/spinner/spinner.component';

import { SPINNER_DELAY_MS } from '@/constants/spinner.constants';
import { STATE_KEYS } from '@/constants/state-keys.constants';

import { reportService } from '@/api/services/report.service';

import styles from './overview-metrics-tab.module.css';
import templateHTML from './overview-metrics-tab.template.html?raw';

import { EquityCurve } from './equity-curve/equity-curve.component';
import { OverviewMetrics } from './overview-metrics/overview-metrics.component';

export class OverviewMetricsTab extends BaseComponent {
	static COMPONENT_NAME = 'OverviewMetricsTab';

	#$element = null;

	render() {
		this.#initComponents();
		this.#initDOM();
		this.#setupInitialState();
		return this.element;
	}

	show() {
		this.#$element.css('display', 'flex');
	}

	hide() {
		this.#$element.css('display', 'none');
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
		stateService.subscribe(
			STATE_KEYS.EXECUTION_CONTEXT,
			this.#handleContextUpdate.bind(this),
		);
		this.#handleContextUpdate(stateService.get(STATE_KEYS.EXECUTION_CONTEXT));
	}

	async #handleContextUpdate(context) {
		try {
			let metrics = { primary: [], equity: [] };

			if (context.id) {
				try {
					metrics = await this.#withSpinner(
						reportService.getOverviewMetrics(context.id),
					);
				} catch {
					metrics = { primary: [], equity: [] };
				}
			}

			if (metrics.equity.length) {
				this.overviewMetrics.update(metrics.primary);
				this.equityCurve.update(metrics.equity);

				this.noData.hide();
			} else {
				this.noData.show();
			}
		} catch (error) {
			console.error('Failed to update overview.', error);
		}
	}

	async #withSpinner(promise) {
		let timer;

		try {
			timer = setTimeout(() => {
				this.spinner.show();
			}, SPINNER_DELAY_MS);

			return await promise;
		} finally {
			clearTimeout(timer);
			this.spinner.hide();
		}
	}
}
