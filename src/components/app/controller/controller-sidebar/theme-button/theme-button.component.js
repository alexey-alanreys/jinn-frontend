import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';
import { themeService } from '@/core/services/theme.service';

import styles from './theme-button.module.css';
import templateHTML from './theme-button.template.html?raw';

export class ThemeButton extends BaseComponent {
	static COMPONENT_NAME = 'ThemeButton';

	#$element = null;

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
		this.#syncVisualState();
	}

	#handleClick() {
		themeService.toggle();
		this.#syncVisualState();
	}

	#syncVisualState() {
		const isActive = themeService.get() === themeService.DARK;
		this.#$element.data('active', isActive.toString());
	}
}
