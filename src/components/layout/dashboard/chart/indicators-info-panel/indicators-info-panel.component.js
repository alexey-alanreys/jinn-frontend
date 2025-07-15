import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './indicators-info-panel.module.css';
import templateHTML from './indicators-info-panel.template.html?raw';

export class IndicatorsInfoPanel extends BaseComponent {
	static COMPONENT_NAME = 'IndicatorsInfoPanel';

	#$element;
	#dataFields = new Map();

	render(isPrimary) {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element);

		if (isPrimary) {
			this.#$element.addClass(styles['primary']);
		} else {
			this.#$element.addClass(styles['secondary']);
		}

		return this.element;
	}

	remove() {
		this.element.remove();
	}

	update(indicators, withRender = false, indicatorKeys = null) {
		if (withRender) {
			if (!indicatorKeys) {
				throw new Error(
					'Indicator keys must be provided when withRender is true',
				);
			}

			this.#dataFields.clear();
			this.#renderFields(indicatorKeys);
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

	#renderFields(indicatorKeys) {
		const html = this.#generateHTML(indicatorKeys);
		this.#$element.html(html);

		this.#$element.findAll('[data-field]').forEach((el) => {
			const key = el.data('field');
			this.#dataFields.set(key, { element: el });
		});
	}

	#generateHTML(indicatorKeys) {
		return indicatorKeys
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
