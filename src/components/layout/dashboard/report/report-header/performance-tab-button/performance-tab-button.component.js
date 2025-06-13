import { BaseComponent } from '@/core/component/base.component.js';
import { renderService } from '@/core/services/render.service';

import styles from './performance-tab-button.module.css';
import templateHTML from './performance-tab-button.template.html?raw';

export class PerformanceTabButton extends BaseComponent {
	render() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		return this.element;
	}
}
