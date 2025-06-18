import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './toggle-sorting-button.module.css';
import templateHTML from './toggle-sorting-button.template.html?raw';

export class ToggleSortingButton extends BaseComponent {
	#$element;

	constructor({ onClick }) {
		super();

		this.onClick = onClick;
	}

	render() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);

		this.#$element = $Q(this.element);
		this.#$element.on('click', this.#handleClick.bind(this));

		return this.element;
	}

	toggleActiveState() {
		this.#$element.data('active', String(!this.isActive()));
	}

	isActive() {
		return this.#$element.is('data-active');
	}

	#handleClick() {
		this.toggleActiveState();
		this.onClick?.();
	}
}
