import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './toggle-sorting-button.module.css';
import templateHTML from './toggle-sorting-button.template.html?raw';

export class ToggleSortingButton extends BaseComponent {
	static COMPONENT_NAME = 'ToggleSortingButton';

	#$element = null;

	constructor({ onClick }) {
		super();
		this.onClick = onClick;
	}

	get isActive() {
		return this.#$element.is('data-active');
	}

	render() {
		this.#initDOM();
		this.#setupInitialState();
		return this.element;
	}

	toggleActiveState() {
		this.#$element.data('active', String(!this.isActive));
	}

	#initDOM() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element);
	}

	#setupInitialState() {
		this.#$element.on('click', this.#handleClick.bind(this));
	}

	#handleClick() {
		this.toggleActiveState();
		this.onClick?.();
	}
}
