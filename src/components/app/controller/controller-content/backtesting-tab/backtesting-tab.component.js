import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';

import { AddConfigButton } from '@/components/ui/controller/buttons/configs/add-config-button/add-config-button.component';
import { CloneConfigsButton } from '@/components/ui/controller/buttons/configs/clone-configs-button/clone-configs-button.component';
import { DeleteConfigsButton } from '@/components/ui/controller/buttons/configs/delete-configs-button/delete-configs-button.component';
import { RunConfigsButton } from '@/components/ui/controller/buttons/configs/run-configs-button/run-configs-button.component';

import styles from './backtesting-tab.module.css';
import templateHTML from './backtesting-tab.template.html?raw';

export class BacktestingTab extends BaseComponent {
	static COMPONENT_NAME = 'BacktestingTab';

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

	#renderInitialItems() {}

	#attachListeners() {
		this.#$element.click(this.#handleClick.bind(this));
	}

	async #handleClick(event) {
		const $target = $Q(event.target);

		if ($target.closest('button')) {
			const $button = $target.closest('button');

			console.log($button);
		}
	}
}
