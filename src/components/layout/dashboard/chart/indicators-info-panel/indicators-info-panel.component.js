import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';
import { stateService } from '@/core/services/state.service';

import styles from './indicators-info-panel.module.css';
import templateHTML from './indicators-info-panel.template.html?raw';

export class IndicatorsInfoPanel extends BaseComponent {
	#$element;
	#dataFields = new Map();

	render() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element);
		return this.element;
	}

	update(indicators, fullUpdate = false) {
		if (fullUpdate) {
			this.#renderIndicatorFields();
		}

		this.#dataFields.forEach(({ element }, key) => {
			let { value, color } = indicators[key];

			if (color === 'transparent') {
				value = '∅';
				color = 'inherit';
			}

			element.text(value).attr('style', `color:${color}`);
		});
	}

	#renderIndicatorFields() {
		const context = stateService.get('context');
		const html = this.#generateIndicatorsHTML(context.indicators);

		this.#$element
			.html(html)
			.findAll('[data-field]')
			.forEach((el) => {
				const key = el.data('field');
				this.#dataFields.set(key, { element: el });
			});
	}

	#generateIndicatorsHTML(indicators) {
		return Object.keys(indicators)
			.map((key) => {
				return `
					<div>
						<span>${key}</span>
						<span data-field="${key}"></span>
					</div>
				`;
			})
			.join('');
	}
}
