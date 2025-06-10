import { Component } from '@/core/component/component.js';
import { renderService } from '@/core/services/render.service';

import styles from './inspector.module.css';
import templateHTML from './inspector.template.html';

export class Inspector extends Component {
	render() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		return this.element;
	}
}
