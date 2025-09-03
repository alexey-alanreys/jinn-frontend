import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import { DeleteButton } from '@/components/ui/controller/buttons/common/delete-button/delete-button.component';

import styles from './strategies-item.module.css';
import templateHTML from './strategies-item.template.html?raw';

export class StrategiesItem extends BaseComponent {
	static COMPONENT_NAME = 'StrategiesItem';

	#$element;
	#dataFields = new Map();

	render() {
		this.#initDOM();
		this.#setupInitialState();
		return this.element;
	}

	update(contextId, context) {
		this.#dataFields.forEach((element, fieldKey) => {
			this.#$element.data('context-id', contextId);
			element.text(context[fieldKey]);

			if (context.isLive) {
				const $statusDot = this.#$element.find('[data-ref="statusDot"]');
				$statusDot.data('active', 'true');
			}
		});
	}

	remove() {
		this.element.remove();
	}

	activate() {
		this.#$element.data('active', 'true');
	}

	deactivate() {
		this.#$element.data('active', 'false');
	}

	#initDOM() {
		this.element = renderService.htmlToElement(
			templateHTML,
			[new DeleteButton({ title: 'Delete Strategy' })],
			styles,
		);
		this.#$element = $Q(this.element);
	}

	#setupInitialState() {
		this.#$element.findAll('[data-field]').forEach((el) => {
			const fieldKey = el.data('field');
			this.#dataFields.set(fieldKey, el);
		});
	}
}
