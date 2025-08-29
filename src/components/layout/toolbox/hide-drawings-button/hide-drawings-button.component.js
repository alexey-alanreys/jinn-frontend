import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { drawingsService } from '@/core/services/drawings.service';
import { renderService } from '@/core/services/render.service';

import { HIDE_DRAWINGS_BUTTON_TITLES as TITLES } from '@/constants/drawings-titles.constants';

import styles from './hide-drawings-button.module.css';
import templateHTML from './hide-drawings-button.template.html?raw';

export class HideDrawingsButton extends BaseComponent {
	static COMPONENT_NAME = 'HideDrawingsButton';

	#$element;

	constructor({ onActivate }) {
		super();

		this.onActivate = onActivate;
	}

	render() {
		this.#initDOM();
		this.#setupInitialState();

		return this.element;
	}

	deactivate() {
		this.#setActive(false);
	}

	get #isActive() {
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
		const newState = !this.#isActive;
		this.#setActive(newState);
		if (newState) this.onActivate?.();
	}

	#setActive(active) {
		this.#$element
			.data('active', active)
			.attr('title', TITLES[active ? 'true' : 'false']);

		active ? drawingsService.hide() : drawingsService.show();
	}
}
