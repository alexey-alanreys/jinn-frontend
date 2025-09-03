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

	#configItems = new Map();
	#controlButtons = {};

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
		this.#controlButtons = {
			delete: new DeleteConfigsButton(),
			clone: new CloneConfigsButton(),
			add: new AddConfigButton(),
			run: new RunConfigsButton(),
		};
	}

	#initDOM() {
		this.element = renderService.htmlToElement(
			templateHTML,
			Object.values(this.#controlButtons),
			styles,
		);
		this.#$element = $Q(this.element);
		this.#$items = this.#$element.find('[data-ref="configItems"]');
	}

	#setupInitialState() {
		this.#loadStoredConfigs();
		this.#attachEventListeners();
	}

	#loadStoredConfigs() {
		const storedConfigs = this.#getStoredConfigs();

		Object.entries(storedConfigs).forEach(([configId, config]) => {
			this.#createConfigItem(configId, config);
		});
	}

	#attachEventListeners() {
		this.#$element.on('change', this.#handleChange.bind(this));
		this.#$element.on('click', this.#handleClick.bind(this));
	}

	#handleChange(event) {
		const configItem = this.#getConfigItemFromEvent(event);

		if (configItem) {
			configItem.handleChange(event);
			this.#saveConfigToStorage(configItem.configId, configItem.config);
		}
	}

	async #handleClick(event) {
		const $target = $Q(event.target).closest('[data-ref]');
		if (!$target) return;

		const ref = $target.data('ref');
		if (ref === 'configItems') return;

		const controlHandlers = {
			addConfigButton: () => this.#handleAddConfig(),
			runConfigsButton: () => this.#handleRunConfigs(),
			cloneConfigsButton: () => this.#handleCloneConfigs(),
			deleteConfigsButton: () => this.#handleDeleteConfigs(),
		};

		if (controlHandlers[ref]) {
			controlHandlers[ref]();
			return;
		}

		const configItem = this.#getConfigItemFromEvent(event);
		if (!configItem) return;

		const itemHandlers = {
			configHeader: () => configItem.toggle(),
			runButton: () => this.#runConfig(configItem.configId),
			deleteButton: () => this.#deleteConfig(configItem.configId),
		};

		if (itemHandlers[ref]) {
			itemHandlers[ref]();
		} else {
			configItem.handleClick(event);
			this.#saveConfigToStorage(configItem.configId, configItem.config);
		}
	}

	#handleAddConfig() {
		const configId = crypto.randomUUID();
		const newItem = this.#createConfigItem(configId);
		this.#saveConfigToStorage(configId, newItem.config);
	}

	#handleRunConfigs() {
		// TODO: Implement run logic

		setTimeout(() => {
			this.#configItems.forEach((item) => item.setProcessing());
		}, 1000);

		setTimeout(() => {
			this.#configItems.forEach((item) => item.setSuccess());
		}, 3000);

		setTimeout(() => {
			this.#configItems.forEach((item) => item.setError());
		}, 5000);

		setTimeout(() => {
			this.#configItems.forEach((item) => item.clearStatus());
		}, 7000);
	}

	#handleCloneConfigs() {
		const itemsToClone = Array.from(this.#configItems.values());

		itemsToClone.forEach((configItem) => {
			const newConfigId = crypto.randomUUID();
			const clonedConfig = { ...configItem.config };

			this.#createConfigItem(newConfigId, clonedConfig);
			this.#saveConfigToStorage(newConfigId, clonedConfig);
		});
	}

	#handleDeleteConfigs() {
		const allConfigIds = Array.from(this.#configItems.keys());
		allConfigIds.forEach((configId) => this.#deleteConfig(configId));
	}

	#createConfigItem(configId, config = null) {
		const item = new ConfigItem({ configId });

		this.#$items.append(item.render());
		this.#configItems.set(configId, item);

		if (config) {
			item.update(config);
		}

		return item;
	}

	#runConfig(configId) {
		// TODO: Implement run logic
		console.log(`runConfig ${configId}`);
	}

	#deleteConfig(configId) {
		const item = this.#configItems.get(configId);

		if (item) {
			item.remove();
			this.#configItems.delete(configId);
			this.#removeConfigFromStorage(configId);
		}
	}

	#getConfigItemFromEvent(event) {
		const $config = $Q(event.target).closest('[data-ref="configItem"]');
		if (!$config) return null;

		const configId = $config.data('config-id');
		return this.#configItems.get(configId);
	}

	#getStoredConfigs() {
		return storageService.getItem(STORAGE_KEYS.OPTIMIZATION_CONFIGS) || {};
	}

	#saveConfigToStorage(configId, config) {
		const storedConfigs = this.#getStoredConfigs();
		storedConfigs[configId] = config;
		storageService.setItem(STORAGE_KEYS.OPTIMIZATION_CONFIGS, storedConfigs);
	}

	#removeConfigFromStorage(configId) {
		const storedConfigs = this.#getStoredConfigs();
		delete storedConfigs[configId];
		storageService.setItem(STORAGE_KEYS.OPTIMIZATION_CONFIGS, storedConfigs);
	}
}
