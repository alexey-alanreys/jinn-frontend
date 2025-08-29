import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { drawingsService } from '@/core/services/drawings.service';
import { renderService } from '@/core/services/render.service';

import styles from './clear-drawings-button.module.css';
import templateHTML from './clear-drawings-button.template.html?raw';

export class ClearDrawingsButton extends BaseComponent {
	static COMPONENT_NAME = 'ClearDrawingsButton';

	#$element;

	render() {
		this.#initDOM();
		this.#setupInitialState();

		return this.element;
	}

	#initDOM() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element);
	}

	#setupInitialState() {
		this.#$element.on('click', this.#handleClick.bind(this));
	}

	#handleClick() {
		drawingsService.removeAll();
		drawingsService.clear();
	}
}
