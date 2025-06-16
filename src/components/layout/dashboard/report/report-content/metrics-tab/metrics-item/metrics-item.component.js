import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './metrics-item.module.css';
import templateHTML from './metrics-item.template.html?raw';

export class MetricsItem extends BaseComponent {
	#$element;

	constructor({ key, value, secondaryValue = null }) {
		super();

		this.key = key;
		this.value = value;
		this.secondaryValue = secondaryValue;
	}

	render() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);

		this.#$element = $Q(this.element);
		return this.element;
	}
}
