import { BaseComponent } from '@/core/component/base.component.js';
import { renderService } from '@/core/services/render.service';

import styles from './toggle-expansion-button.module.css';
import templateHTML from './toggle-expansion-button.template.html?raw';

export class ToggleExpansionButton extends BaseComponent {
	render() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		return this.element;
	}
}
