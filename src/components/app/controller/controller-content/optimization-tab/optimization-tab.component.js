import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';
import { storageService } from '@/core/services/storage.service';

import { AddConfigButton } from '@/components/ui/controller/buttons/configs/add-config-button/add-config-button.component';
import { CloneConfigsButton } from '@/components/ui/controller/buttons/configs/clone-configs-button/clone-configs-button.component';
import { DeleteConfigsButton } from '@/components/ui/controller/buttons/configs/delete-configs-button/delete-configs-button.component';
import { RunConfigsButton } from '@/components/ui/controller/buttons/configs/run-configs-button/run-configs-button.component';

import { STORAGE_KEYS } from '@/constants/storage-keys.constants';

import styles from './optimization-tab.module.css';
import templateHTML from './optimization-tab.template.html?raw';

import { ConfigItem } from './config-item/config-item.component';

export class OptimizationTab extends BaseComponent {
	static COMPONENT_NAME = 'OptimizationTab';

	#$element;
	#$items;

	#items = new Map();

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
		this.#$items = this.#$element.find('[data-ref="configItems"]');
	}

	#setupInitialState() {
		this.#renderInitialItems();
		this.#attachListeners();
	}

	#renderInitialItems() {
		const stored =
			storageService.getItem(STORAGE_KEYS.OPTIMIZATION_CONFIGS) || {};
		if (!Object.keys(stored).length) return;

		Object.entries(stored).forEach(([configId, config]) => {
			const item = new ConfigItem({ configId });
			this.#$items.append(item.render());
			this.#items.set(configId, item);
			item.update(config);
		});
	}

	#attachListeners() {
		this.#$element.on('change', this.#handleChange.bind(this));
		this.#$element.click(this.#handleClick.bind(this));
	}

	#handleChange(event) {}

	async #handleClick(event) {
		const $target = $Q(event.target).closest('[data-ref]');
		if (!$target) return;

		const ref = $target.data('ref');
		if (ref === 'configItems') return;

		switch (ref) {
			case 'addConfigButton':
				this.#handleAddConfig();
				break;
			case 'runConfigsButton':
				this.#handleRunConfigs();
				break;
			case 'cloneConfigsButton':
				this.#handleCloneConfigs();
				break;
			case 'deleteConfigsButton':
				this.#handleDeleteConfigs();
				break;
		}

		const configItem = $target.closest('[data-ref="configItem"]');
		const configId = configItem.data('config-id');
		const item = this.#items.get(configId);

		switch (ref) {
			case 'configHeader':
				item.toggle();
				break;
			case 'deleteButton':
				this.#handleDeleteConfig();
				break;
			default:
				item.handleClick(event);
		}
	}

	#handleAddConfig() {
		const configId = crypto.randomUUID();
		const item = new ConfigItem({ configId });

		this.#$items.append(item.render());
		this.#items.set(configId, item);

		const stored =
			storageService.getItem(STORAGE_KEYS.OPTIMIZATION_CONFIGS) || {};
		storageService.setItem(STORAGE_KEYS.OPTIMIZATION_CONFIGS, {
			...stored,
			[configId]: item.config,
		});
	}

	#handleRunConfigs() {
		console.log('handleRunConfigs');
	}

	#handleCloneConfigs() {
		console.log('handleCloneConfigs');
	}

	#handleDeleteConfigs() {
		console.log('handleDeleteConfigs');
	}

	#handleDeleteConfig() {
		console.log('handleDeleteConfig');
	}
}
