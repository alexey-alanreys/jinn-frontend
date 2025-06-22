import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';
import { stateService } from '@/core/services/state.service';

import { dataService } from '@/api/data.service';

import styles from './overview-tab.module.css';
import templateHTML from './overview-tab.template.html?raw';

import { EquityCurve } from './equity-curve/equity-curve.component';

export class OverviewTab extends BaseComponent {
	static #PROFIT_FIELDS = [0, 1, 5, 6];

	#$element;
	#dataFields = new Map();
	#redTextClass = styles['text-red'];
	#greenTextClass = styles['text-green'];

	render() {
		this.#initComponents();
		this.#initDOM();
		this.#setupInitialState();

		return this.element;
	}

	async update() {
		try {
			const contextId = stateService.get('contextId');
			const overview = await dataService.getReportOverview(contextId);

			this.#dataFields.forEach(({ element, isProfitField }, index) => {
				const value = overview.metrics[index];
				element.text(value);

				if (isProfitField) {
					this.#applyColorClass(element, value);
				}
			});
			this.equityCurve.update(overview.equity);
		} catch (error) {
			console.error('Failed to update overview:', error);
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
	}

	#initDOM() {
		this.element = renderService.htmlToElement(
			templateHTML,
			[this.equityCurve],
			styles,
		);

		this.#$element = $Q(this.element);
		this.#$element.findAll('[data-field]').forEach((el) => {
			const index = Number(el.data('field'));
			const isProfitField = this.#isProfitField(index);
			this.#dataFields.set(index, { element: el, isProfitField });
		});
	}

	#setupInitialState() {
		stateService.subscribe('contextId', this.update.bind(this));
		stateService.subscribe('summary', this.update.bind(this));

		this.update();
	}

	#isProfitField(index) {
		return OverviewTab.#PROFIT_FIELDS.includes(index);
	}

	#applyColorClass(element, value) {
		if (value.startsWith('-')) {
			element.addClass(this.#redTextClass);
			element.removeClass(this.#greenTextClass);
		} else {
			element.addClass(this.#greenTextClass);
			element.removeClass(this.#redTextClass);
		}
	}
}
