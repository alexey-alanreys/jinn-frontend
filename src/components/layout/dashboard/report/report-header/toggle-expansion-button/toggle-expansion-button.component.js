import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './toggle-expansion-button.module.css';
import templateHTML from './toggle-expansion-button.template.html?raw';

import { TOGGLE_BUTTON_TITLES as TITLES } from '@/constants/toggle-titles.constant';

export class ToggleExpansionButton extends BaseComponent {
	#$element;

	render() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);

		this.#$element = $Q(this.element);
		this.#$element.on('click', this.#handleClick.bind(this));

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

	#handleClick() {
		this.toggleActiveState();
		this.props.onClick?.();
	}
}
