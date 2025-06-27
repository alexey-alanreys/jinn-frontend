import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';
import { stateService } from '@/core/services/state.service';

import styles from './ruler-tool-button.module.css';
import templateHTML from './ruler-tool-button.template.html?raw';

export class RulerToolButton extends BaseComponent {
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
		if (!this.#isActive()) return;

		this.#$element.data('active', 'false');
		this.element.blur();

		const rulerTool = stateService.get('rulerTool');
		rulerTool.deactivate();
	}

	#initDOM() {
		this.element = renderService.htmlToElement(templateHTML, [], styles);
		this.#$element = $Q(this.element);
	}

	#setupInitialState() {
		this.#$element.on('click', this.#handleClick.bind(this));
	}

	#handleClick() {
		if (this.#isActive()) {
			this.deactivate();
		} else {
			this.#activate();
			this.onActivate?.();
		}
	}

	#isActive() {
		return this.#$element.is('data-active');
	}

	#activate() {
		this.#$element.data('active', 'true');

		const rulerTool = stateService.get('rulerTool');
		rulerTool.subscribeToChart(this.deactivate.bind(this));
	}
}
