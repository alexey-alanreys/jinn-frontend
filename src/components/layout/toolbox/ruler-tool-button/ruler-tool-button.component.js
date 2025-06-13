import { BaseComponent } from '@/core/component/base.component.js';
import { renderService } from '@/core/services/render.service';

import styles from './ruler-tool-button.module.css';
import templateHTML from './ruler-tool-button.template.html?raw';

export class RulerToolButton extends BaseComponent {
	render() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		return this.element;
	}
}
