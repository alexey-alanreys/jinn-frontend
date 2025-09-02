import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import { AddConfigButton } from '@/components/ui/controller/buttons/configs/add-config-button/add-config-button.component';
import { CloneConfigsButton } from '@/components/ui/controller/buttons/configs/clone-configs-button/clone-configs-button.component';
import { DeleteConfigsButton } from '@/components/ui/controller/buttons/configs/delete-configs-button/delete-configs-button.component';
import { RunConfigsButton } from '@/components/ui/controller/buttons/configs/run-configs-button/run-configs-button.component';
import { CustomSelect } from '@/components/ui/controller/inputs/custom-select/custom-select.component';
import { DateInput } from '@/components/ui/controller/inputs/date-input/date-input.component';
import { TextInput } from '@/components/ui/controller/inputs/text-input/text-input.component';

import styles from './optimization-tab.module.css';
import templateHTML from './optimization-tab.template.html?raw';

export class OptimizationTab extends BaseComponent {
	static COMPONENT_NAME = 'OptimizationTab';

	#$element;

	get isActive() {
		return this.#$element.css('display') === 'flex';
	}

	render() {
		this.#initComponents();
		this.#initDOM();
		this.#setupInitialState();

		return this.element;
	}

	show() {
		this.#$element.css('display', 'flex');
	}

	hide() {
		this.#$element.css('display', 'none');
	}

	#initComponents() {
		this.deleteConfigsButton = new DeleteConfigsButton();
		this.cloneConfigsButton = new CloneConfigsButton();
		this.addConfigButton = new AddConfigButton();
		this.runConfigsButton = new RunConfigsButton();
	}

	#initDOM() {
		this.element = renderService.htmlToElement(
			templateHTML,
			[
				this.deleteConfigsButton,
				this.cloneConfigsButton,
				this.addConfigButton,
				this.runConfigsButton,
			],
			styles,
		);
		this.#$element = $Q(this.element);
	}

	#setupInitialState() {
		this.#renderInitialItems();
		this.#attachListeners();
	}

	#renderInitialItems() {
		const $configItems = this.#$element.find('[data-ref="configItems"]');

		const inputText = new TextInput({ placeholder: 'BTCUSDT' });
		$configItems.append(inputText.render());

		this.dateInput = new DateInput();
		$configItems.append(this.dateInput.render());

		const select = new CustomSelect({
			options: ['BINANCE', 'BYBIT'],
		});
		$configItems.append(select.render());
	}

	#attachListeners() {
		this.#$element.on('change', this.#handleChange.bind(this));
		this.#$element.click(this.#handleClick.bind(this));
	}

	#handleChange(event) {
		const $dateInput = $Q(event.target).closest('[data-ref="dateInput"]');
		if (!$dateInput) return;

		if (this.dateInput.isValid()) {
			this.dateInput.commit(this.dateInput.value);
		} else {
			this.dateInput.rollback();
		}
	}

	async #handleClick(event) {
		const $target = $Q(event.target);

		if ($target.closest('button')) {
			const $button = $target.closest('button');
			console.log($button);
		}
	}
}
