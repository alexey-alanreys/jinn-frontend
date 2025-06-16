import { BaseComponent } from '@/core/component/base.component.js';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './chart.module.css';
import templateHTML from './chart.template.html?raw';

export class Chart extends BaseComponent {
	#$element;

	render() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);

		this.#$element = $Q(this.element);
		return this.element;
	}

	setHeight(height) {
		this.#$element.css('bottom', `${height}px`);
	}
}
