import { BaseComponent } from '@/core/component/base.component';
import { renderService } from '@/core/services/render.service';

import styles from './full-screen-button.module.css';
import templateHTML from './full-screen-button.template.html?raw';

export class FullScreenButton extends BaseComponent {
	render() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		return this.element;
	}
}
