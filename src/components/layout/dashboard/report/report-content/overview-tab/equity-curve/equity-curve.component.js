import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './equity-curve.module.css';
import templateHTML from './equity-curve.template.html?raw';

export class EquityCurve extends BaseComponent {
	#$element;

	render() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element);
		return this.element;
	}
}
