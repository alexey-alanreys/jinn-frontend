import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './optimization-tab.module.css';
import templateHTML from './optimization-tab.template.html?raw';

export class OptimizationTab extends BaseComponent {
	static COMPONENT_NAME = 'OptimizationTab';

	#$element;

	get isActive() {
		return this.#$element.css('display') === 'flex';
	}

	render() {
		this.#initDOM();
		this.#setupInitialState();

		return this.element;
	}

	show() {
		this.#$element.css('display', 'flex');
	}

	hide() {
		this.#$element.css('display', 'none');
	}

	#initDOM() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element);
	}

	#setupInitialState() {
		this.#renderInitialItems();
		this.#attachListeners();
	}

	#renderInitialItems() {}

	#attachListeners() {}
}
