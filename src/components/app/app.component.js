import { BaseComponent } from '@/core/component/base.component';
import { renderService } from '@/core/services/render.service';

import styles from './app.module.css';
import templateHTML from './app.template.html?raw';

import { Controller } from './controller/controller.component';
import { Dashboard } from './dashboard/dashboard.component';
import { Notification } from './notification/notification.component';
import { Toolbox } from './toolbox/toolbox.component';

export class App extends BaseComponent {
	static COMPONENT_NAME = 'App';

	render() {
		this.element = renderService.htmlToElement(
			templateHTML,
			[Toolbox, Dashboard, Controller, Notification],
			styles,
		);
		return this.element;
	}
}
