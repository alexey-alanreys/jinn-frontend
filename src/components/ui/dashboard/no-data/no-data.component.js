import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './no-data.module.css';
import templateHTML from './no-data.template.html?raw';

export class NoData extends BaseComponent {
	static COMPONENT_NAME = 'NoData';

	#$element;

	get isActive() {
		return this.#$element.css('display') === 'flex';
	}

	render() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element);
		return this.element;
	}

	hide() {
		this.#$element.css('display', 'none');
	}

	show() {
		this.#$element.css('display', 'flex');
	}
}
