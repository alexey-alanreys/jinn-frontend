import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import styles from './equity-tooltip.module.css';
import templateHTML from './equity-tooltip.template.html?raw';

export class EquityTooltip extends BaseComponent {
	static #DATE_LOCALE_OPTIONS = {
		weekday: 'short',
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
		timeZone: 'UTC',
	};
	static #OFFSET_X = 15;

	#$element;
	#active = false;
	#dataFields = new Map();

	render() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element);

		['deal', 'equity', 'time'].forEach((field) => {
			const el = this.#$element.find(`[data-field="${field}"]`);
			this.#dataFields.set(field, el);
		});

		return this.element;
	}

	updatePosition({ left, bottom }) {
		this.#$element.css('left', `${left}px`).css('bottom', `${bottom}px`);
	}

	updateContent({ deal, equity, timestamp }) {
		const date = new Date(timestamp * 1000);
		const formatted = date
			.toLocaleString('ru-RU', EquityTooltip.#DATE_LOCALE_OPTIONS)
			.replace(',', '');

		this.#setText('deal', String(deal));
		this.#setText('equity', `${equity} USDT`);
		this.#setText('time', formatted);
	}

	getWidth() {
		return parseInt(this.#$element.css('width'));
	}

	getHeight() {
		return parseInt(this.#$element.css('height'));
	}

	getOffsetX() {
		return EquityTooltip.#OFFSET_X;
	}

	get isActive() {
		return this.#active;
	}

	activate() {
		this.#$element.data('active', 'true');
		this.#active = true;
	}

	deactivate() {
		this.#$element.data('active', 'false');
		this.#active = false;
	}

	#setText(field, text) {
		this.#dataFields.get(field).text(text);
	}
}
