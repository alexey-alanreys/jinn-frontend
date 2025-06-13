import { BaseComponent } from '@/core/component/base.component.js';
import { renderService } from '@/core/services/render.service';

import styles from './clear-drawing-button.module.css';
import templateHTML from './clear-drawing-button.template.html?raw';

export class ClearDrawingButton extends BaseComponent {
	render() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		return this.element;
	}
}
