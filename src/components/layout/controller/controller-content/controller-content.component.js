import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './controller-content.module.css';
import templateHTML from './controller-content.template.html?raw';

import { AlertsTab } from './alerts-tab/alerts-tab.component';
import { ParamsTab } from './params-tab/params-tab.component';
import { StrategiesTab } from './strategies-tab/strategies-tab.component';

export class ControllerContent extends BaseComponent {
	static COMPONENT_NAME = 'ControllerContent';

	#$element;

	render() {
		this.#initComponents();
		this.#initDOM();

		return this.element;
	}

	showOnly(tabName) {
		const isTabAlreadyVisible = this.tabs[tabName].isActive;

		if (isTabAlreadyVisible && this.#isActive) {
			this.#hide();
			return;
		}

		this.#show();
		this.#activateTab(tabName);
	}

	get #isActive() {
		return this.#$element.css('display') === 'flex';
	}

	#initComponents() {
		this.tabs = {
			strategies: new StrategiesTab(),
			params: new ParamsTab(),
			alerts: new AlertsTab(),
		};
	}

	#initDOM() {
		this.element = renderService.htmlToElement(
			templateHTML,
			Object.values(this.tabs),
			styles,
		);
		this.#$element = $Q(this.element);
	}

	#hide() {
		this.#$element.css('display', 'none');
	}

	#show() {
		this.#$element.css('display', 'flex');
	}

	#activateTab(tabNameToShow) {
		for (const [name, tab] of Object.entries(this.tabs)) {
			if (name === tabNameToShow) {
				tab.show();
			} else {
				tab.hide();
			}
		}
	}
}
