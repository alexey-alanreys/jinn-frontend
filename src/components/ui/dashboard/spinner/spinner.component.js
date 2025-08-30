import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './spinner.module.css';
import templateHTML from './spinner.template.html?raw';

export class Spinner extends BaseComponent {
	static COMPONENT_NAME = 'Spinner';

	#$element;

	render() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element);

		return this.element;
	}

	hide() {
		this.#$element.css('display', 'none');
	}
}
