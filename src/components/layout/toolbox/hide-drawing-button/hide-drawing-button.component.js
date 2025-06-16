import { BaseComponent } from '@/core/component/base.component';
import { renderService } from '@/core/services/render.service';

import styles from './hide-drawing-button.module.css';
import templateHTML from './hide-drawing-button.template.html?raw';

export class HideDrawingButton extends BaseComponent {
	render() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		return this.element;
	}
}
