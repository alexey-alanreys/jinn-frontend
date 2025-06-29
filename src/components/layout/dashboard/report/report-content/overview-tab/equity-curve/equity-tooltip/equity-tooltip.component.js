import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import {
	DATE_FMT,
	TOOLTIP_OFFSET_X,
} from '@/constants/equity-tooltip.constants';

import styles from './equity-tooltip.module.css';
import templateHTML from './equity-tooltip.template.html?raw';

export class EquityTooltip extends BaseComponent {
	#$element;

	#active = false;
	#dataFields = new Map();

	get width() {
		return parseInt(this.#$element.css('width'));
	}

	get height() {
		return parseInt(this.#$element.css('height'));
	}

	get offsetX() {
		return TOOLTIP_OFFSET_X;
	}

	get isActive() {
		return this.#active;
	}

	render() {
		this.#initDOM();
		this.#setupInitialState();

		return this.element;
	}

	updateContent({ deal, equity, timestamp }) {
		const date = new Date(timestamp * 1000);
		const time = date.toLocaleString('ru-RU', DATE_FMT).replace(',', '');

		this.#setText('deal', `${deal}`);
		this.#setText('equity', `${equity} USDT`);
		this.#setText('time', time);
	}

	updatePosition({ left, bottom }) {
		this.#$element.css('left', `${left}px`).css('bottom', `${bottom}px`);
	}

	activate() {
		this.#$element.data('active', 'true');
		this.#active = true;
	}

	deactivate() {
		this.#$element.data('active', 'false');
		this.#active = false;
	}

	#initDOM() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element);
	}

	#setupInitialState() {
		['deal', 'equity', 'time'].forEach((field) => {
			const $el = this.#$element.find(`[data-field="${field}"]`);
			this.#dataFields.set(field, $el);
		});
	}

	#setText(field, text) {
		this.#dataFields.get(field).text(text);
	}
}
