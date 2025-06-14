import { BaseComponent } from '@/core/component/base.component.js';
import { renderService } from '@/core/services/render.service';

import styles from './toggle-visibility-button.module.css';
import templateHTML from './toggle-visibility-button.template.html?raw';

export class ToggleVisibilityButton extends BaseComponent {
	render() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		return this.element;
	}
}
