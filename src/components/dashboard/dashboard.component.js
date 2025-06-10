import { Component } from '@/core/component/component.js';
import { renderService } from '@/core/services/render.service';

import styles from './dashboard.module.css';
import templateHTML from './dashboard.template.html';

export class Dashboard extends Component {
	render() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		return this.element;
	}
}
