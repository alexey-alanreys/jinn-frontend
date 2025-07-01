import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';
import { stateService } from '@/core/services/state.service';
import { storageService } from '@/core/services/storage.service';

import styles from './theme-button.module.css';
import templateHTML from './theme-button.template.html?raw';

export class ThemeButton extends BaseComponent {
	#$element;
	#$document;

	render() {
		this.#initDOM();
		this.#setupInitialState();

		return this.element;
	}

	get #currentTheme() {
		return document.documentElement.getAttribute('data-theme') || 'light';
	}

	get #nextTheme() {
		return this.#currentTheme === 'dark' ? 'light' : 'dark';
	}

	#initDOM() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);

		this.#$element = $Q(this.element);
		this.#$document = $Q(document.documentElement);
	}

	#setupInitialState() {
		this.#$element.on('click', this.#handleClick.bind(this));
		this.#syncVisualState(this.#currentTheme);
	}

	#handleClick() {
		const nextTheme = this.#nextTheme;

		this.#$document.data('theme', nextTheme);
		storageService.setItem('theme', nextTheme);
		stateService.set('theme', nextTheme);

		this.#syncVisualState(nextTheme);
	}

	#syncVisualState(theme) {
		if (theme === 'dark') {
			this.#$element.data('active', 'true');
		} else {
			this.#$element.data('active', 'false');
		}
	}
}
