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
			this.#renderFields();
		}

		this.#dataFields.forEach(({ element }, key) => {
			const data = indicators[key];
			if (!data) return;

			let { value, color } = data;

			if (color === 'transparent') {
				value = '∅';
				color = 'inherit';
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

	hide() {
		this.#$element.css('display', 'none');
	}

	show() {
		this.#$element.css('display', 'flex');
	}

	#renderFields() {
		const { indicatorOptions } = stateService.get('context');

		const html = this.#generateHTML(indicatorOptions);
		this.#$element.html(html);

		this.#$element.findAll('[data-field]').forEach((el) => {
			const key = el.data('field');
			this.#dataFields.set(key, { element: el });
		});
	}

	#generateHTML(indicatorOptions) {
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
