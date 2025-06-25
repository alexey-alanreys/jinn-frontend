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

	update(indicators, withRender = false) {
		if (withRender) {
			this.#dataFields.clear();
			this.#renderIndicatorFields();
		}

		this.#dataFields.forEach(({ element }, key) => {
			const data = indicators[key];
			if (!data) return;

			let { value, color } = data;

			if (color === 'transparent') {
				value = '∅';
				color = 'rgb(41, 33, 33)';
			}

			const currentText = element.text();
			const currentColor = element.css('color');

			if (currentText !== String(value)) {
				element.text(value);
			}

			if (currentColor !== color) {
				element.css('color', color);
			}
		});
	}

	#renderIndicatorFields() {
		const { indicatorOptions } = stateService.get('context');
		const html = this.#generateIndicatorsHTML(indicatorOptions);

		this.#$element
			.html(html)
			.findAll('[data-field]')
			.forEach((el) => {
				const key = el.data('field');
				this.#dataFields.set(key, { element: el });
			});
	}

	#generateIndicatorsHTML(indicatorOptions) {
		return Object.keys(indicatorOptions)
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
