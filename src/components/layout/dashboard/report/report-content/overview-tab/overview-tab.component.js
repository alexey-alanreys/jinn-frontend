import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';
import { stateService } from '@/core/services/state.service';

import { reportService } from '@/api/services/report.service';

import styles from './overview-tab.module.css';
import templateHTML from './overview-tab.template.html?raw';

import { EquityCurve } from './equity-curve/equity-curve.component';
import { OverviewEmpty } from './overview-empty/overview-empty.component';

export class OverviewTab extends BaseComponent {
	static #PROFIT_FIELDS = [0, 1, 5, 6];

	#$element;
	#$metrics;

	#dataFields = new Map();

	render() {
		this.#initComponents();
		this.#initDOM();
		this.#setupInitialState();

		return this.element;
	}

	async update(context) {
		try {
			const overview = await reportService.getOverview(context.id);
			const hasData = overview.equity.length > 0;

			if (!hasData) {
				if (!this.overviewEmpty.isActive) {
					this.#$metrics.css('display', 'none');
					this.equityCurve.hide();
					this.overviewEmpty.show();
				}
				return;
			}

			if (!this.overviewEmpty.isActive) {
				this.#$metrics.css('display', 'flex');
				this.equityCurve.show();
			} else {
				this.overviewEmpty.hide();
				this.#$metrics.css('display', 'flex');
				this.equityCurve.show();
			}

			this.#dataFields.forEach(({ element, isProfitField }, index) => {
				const value = overview.metrics[index];
				element.text(value);

				if (isProfitField) {
					this.#applyColorClass(element, value);
				}
			});

			this.equityCurve.update(overview.equity);
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
		this.equityCurve = new EquityCurve();
		this.overviewEmpty = new OverviewEmpty();
	}

	#initDOM() {
		this.element = renderService.htmlToElement(
			templateHTML,
			[this.equityCurve, this.overviewEmpty],
			styles,
		);

		this.#$element = $Q(this.element);
		this.#$metrics = this.#$element.find('[data-ref="metrics"]');
	}

	#setupInitialState() {
		this.#$element.findAll('[data-field]').forEach((el) => {
			const index = Number(el.data('field'));
			const isProfitField = this.#isProfitField(index);
			this.#dataFields.set(index, { element: el, isProfitField });
		});

		stateService.subscribe('context', this.update.bind(this));
		this.update(stateService.get('context'));
	}

	#isProfitField(index) {
		return OverviewTab.#PROFIT_FIELDS.includes(index);
	}

	#applyColorClass(element, value) {
		if (value.startsWith('-')) {
			element.removeClass(styles.green).addClass(styles.red);
		} else {
			element.removeClass(styles.red).addClass(styles.green);
		}
	}
}
