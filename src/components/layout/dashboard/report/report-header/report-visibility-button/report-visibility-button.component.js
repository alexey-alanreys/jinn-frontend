import { BaseComponent } from '@/core/component/base.component.js';
import { renderService } from '@/core/services/render.service';

import styles from './report-visibility-button.module.css';
import templateHTML from './report-visibility-button.template.html?raw';

export class ReportVisibilityButton extends BaseComponent {
	render() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		return this.element;
	}
}
