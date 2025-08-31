import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './open-button.module.css';
import templateHTML from './open-button.template.html?raw';

export class OpenButton extends BaseComponent {
	static COMPONENT_NAME = 'OpenButton';

	#title;

	constructor({ title }) {
		super();

		this.#title = title;
	}

	render() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		$Q(this.element).attr('title', this.#title);
		return this.element;
	}
}
