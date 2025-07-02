import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import { TOGGLE_BUTTON_TITLES as TITLES } from '@/constants/toggle-titles.constants';

import styles from './toggle-visibility-button.module.css';
import templateHTML from './toggle-visibility-button.template.html?raw';

export class ToggleVisibilityButton extends BaseComponent {
	static componentName = 'ToggleVisibilityButton';

	#$element;

	constructor({ onClick }) {
		super();

		this.onClick = onClick;
	}

	get isActive() {
		return this.#$element.is('data-active');
	}

	render() {
		this.#initComponents();
		this.#setupInitialState();

		return this.element;
	}

	toggleActiveState() {
		const newState = String(!this.isActive);

		this.#$element
			.data('active', newState)
			.attr('title', TITLES.visibility[newState]);
	}

	#initComponents() {
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
