import { BaseComponent } from '@/core/component/base.component';
import { renderService } from '@/core/services/render.service';

import styles from './controller-sidebar.module.css';
import templateHTML from './controller-sidebar.template.html?raw';

import { AlertsTabButton } from './alerts-tab-button/alerts-tab-button.component';
import { ParamsTabButton } from './params-tab-button/params-tab-button.component';
import { StrategiesTabButton } from './strategies-tab-button/strategies-tab-button.component';
import { ThemeButton } from './theme-button/theme-button.component';

export class ControllerSidebar extends BaseComponent {
	static COMPONENT_NAME = 'ControllerSidebar';

	render() {
		this.#initComponents();
		this.#initDOM();

		return this.element;
	}

	connectButtons(onTabChange) {
		Object.entries(this.buttons).forEach(([name, button]) => {
			button.setOnClick(() => {
				if (button.isActive) {
					button.deactivate();
				} else {
					this.#setActiveOnly(name);
				}

				onTabChange?.(name);
			});
		});
	}

	#initComponents() {
		this.buttons = {
			strategies: new StrategiesTabButton(),
			params: new ParamsTabButton(),
			alerts: new AlertsTabButton(),
		};
		this.themeButton = new ThemeButton();
	}

	#initDOM() {
		this.element = renderService.htmlToElement(
			templateHTML,
			[...Object.values(this.buttons), this.themeButton],
			styles,
		);
	}

	#setActiveOnly(buttonName) {
		for (const [name, button] of Object.entries(this.buttons)) {
			name === buttonName ? button.activate() : button.deactivate();
		}
	}
}
