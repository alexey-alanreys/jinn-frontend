import { BaseComponent } from '@/core/component/base.component';
import { renderService } from '@/core/services/render.service';

import styles from './controller.module.css';
import templateHTML from './controller.template.html?raw';

import { ControllerContent } from './controller-content/controller-content.component';
import { ControllerSidebar } from './controller-sidebar/controller-sidebar.component';

export class Controller extends BaseComponent {
	static COMPONENT_NAME = 'Controller';

	render() {
		this.#initComponents();
		this.#initDOM();
		this.#setupInitialState();

		return this.element;
	}

	#initComponents() {
		this.controllerContent = new ControllerContent();
		this.controllerSidebar = new ControllerSidebar();
	}

	#initDOM() {
		this.element = renderService.htmlToElement(
			templateHTML,
			[this.controllerContent, this.controllerSidebar],
			styles,
		);
	}

	#setupInitialState() {
		this.controllerSidebar.connectButtons((tabName) => {
			this.controllerContent.showOnly(tabName);
		});
	}
}
