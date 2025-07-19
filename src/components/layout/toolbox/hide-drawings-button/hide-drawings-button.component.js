import { HIDE_DRAWINGS_BUTTON_TITLES as TITLES } from '@/constants/drawings-titles.constants';
import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';
import { stateService } from '@/core/services/state.service';


import styles from './hide-drawings-button.module.css';
import templateHTML from './hide-drawings-button.template.html?raw';

export class HideDrawingsButton extends BaseComponent {
	static COMPONENT_NAME = 'HideDrawingsButton';

	#$element;

	constructor({ onActivate }) {
		super();

		this.onActivate = onActivate;
	}

	render() {
		this.#initDOM();
		this.#setupInitialState();

		return this.element;
	}

	deactivate() {
		if (!this.#isActive) return;

		this.#$element.data('active', 'false').attr('title', TITLES['false']);
		this.#showDrawings(stateService.get('drawings'));
	}

	get #isActive() {
		return this.#$element.is('data-active');
	}

	#initDOM() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element);
	}

	#setupInitialState() {
		this.#$element.on('click', this.#handleClick.bind(this));
		stateService.subscribe('drawings', this.#hideDrawings.bind(this));
	}

	#handleClick() {
		if (this.#isActive) {
			this.deactivate();
		} else {
			this.#activate();
			this.onActivate?.();
		}
	}

	#activate() {
		this.#$element.data('active', 'true').attr('title', TITLES['true']);
		this.#hideDrawings(stateService.get('drawings'));
	}

	#showDrawings(drawings) {
		if (!drawings?.length) return;
		drawings.forEach((series) => series.applyOptions({ visible: true }));
	}

	#hideDrawings(drawings) {
		if (!this.#isActive || !drawings.length) return;
		drawings.forEach((series) => series.applyOptions({ visible: false }));
	}
}
