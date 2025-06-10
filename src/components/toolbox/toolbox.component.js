import { Component } from '@/core/component/component.js';
import { renderService } from '@/core/services/render.service';

import templateHTML from './toolbox.template.html';

import styles from './toolbox.module.css';

export class Toolbox extends Component {
	render() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		return this.element;
	}
}
