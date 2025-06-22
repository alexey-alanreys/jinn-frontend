import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import { TOGGLE_BUTTON_TITLES as TITLES } from '@/constants/toggle-titles.constants';

import styles from './toggle-expansion-button.module.css';
import templateHTML from './toggle-expansion-button.template.html?raw';

export class ToggleExpansionButton extends BaseComponent {
	#$element;

	constructor({ onClick }) {
		super();

		this.onClick = onClick;
	}

	render() {
		this.#initDOM();
		this.#setupInitialState();

		return this.element;
	}

	toggleActiveState() {
		const newState = String(!this.isActive());

		this.#$element
			.data('active', newState)
			.attr('title', TITLES.expansion[newState]);
	}

	isActive() {
		return this.#$element.is('data-active');
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
