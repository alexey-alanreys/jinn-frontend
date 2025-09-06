import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { notificationService } from '@/core/services/notification.service';
import { renderService } from '@/core/services/render.service';
import { stateService } from '@/core/services/state.service';
import { storageService } from '@/core/services/storage.service';

import { AddConfigButton } from '@/components/ui/controller/buttons/configs/add-config-button/add-config-button.component';
import { CloneConfigsButton } from '@/components/ui/controller/buttons/configs/clone-configs-button/clone-configs-button.component';
import { DeleteConfigsButton } from '@/components/ui/controller/buttons/configs/delete-configs-button/delete-configs-button.component';
import { ExportConfigsButton } from '@/components/ui/controller/buttons/configs/export-configs-button/export-configs-button.component';
import { ImportConfigsButton } from '@/components/ui/controller/buttons/configs/import-configs-button/import-configs-button.component';
import { RunConfigsButton } from '@/components/ui/controller/buttons/configs/run-configs-button/run-configs-button.component';

import { CONTEXT_STATUS } from '@/constants/context-status.constants';
import { POLLING_INTERVAL_LONG } from '@/constants/polling.constants';
import { STATE_KEYS } from '@/constants/state-keys.constants';
import { STORAGE_KEYS } from '@/constants/storage-keys.constants';

import { exportConfigs } from '@/utils/export-configs.util';
import { validateConfig } from '@/utils/validate-config.util';

import { optimizationService } from '@/api/services/optimization.service';

import styles from './optimization-tab.module.css';
import templateHTML from './optimization-tab.template.html?raw';

import { ConfigItem } from './config-item/config-item.component';

export class OptimizationTab extends BaseComponent {
	static COMPONENT_NAME = 'OptimizationTab';
	static REQUIRED_KEYS = [
		'strategy',
		'symbol',
		'interval',
		'exchange',
		'start',
		'end',
	];

	#$element = null;
	#$items = null;
	#controlButtons = null;

	#configItems = new Map();

	#pollingIntervalId;

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
			import: new ImportConfigsButton(),
			export: new ExportConfigsButton(),
			add: new AddConfigButton(),
			clone: new CloneConfigsButton(),
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

	async #setupInitialState() {
		this.#loadStoredConfigs();
		this.#attachEventListeners();
		await this.#syncStatusesWithBackend();
	}

	#attachEventListeners() {
		this.#$element.on('change', this.#handleChange.bind(this));
		this.#$element.on('click', this.#handleClick.bind(this));
	}

	#handleChange(event) {
		const $target = $Q(event.target).closest('[data-ref]');

		if ($target.data('ref') === 'fileInput') {
			this.#importConfigs(event.target.files);
			return;
		}

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
			runConfigsButton: () => this.#handleRunConfigs(),
			cloneConfigsButton: () => this.#handleCloneConfigs(),
			addConfigButton: () => this.#handleAddConfig(),
			exportConfigsButton: () => this.#handleExportConfigs(),
			importConfigsButton: () => this.#handleImportConfigs(),
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
			runButton: () => this.#handleRunConfigs([configItem.configId]),
			deleteButton: () => this.#handleDeleteConfigs([configItem.configId]),
		};

		if (itemHandlers[ref]) {
			itemHandlers[ref]();
		} else {
			configItem.handleClick(event);
			this.#saveConfigToStorage(configItem.configId, configItem.config);
		}
	}

	async #handleRunConfigs(configIds = null) {
		const ids = configIds || Array.from(this.#configItems.keys());
		if (!ids.length) return;

		const configs = {};
		ids.forEach((id) => (configs[id] = this.#configItems.get(id).config));

		try {
			const { added } = await optimizationService.add(configs);

			added.forEach((id) => this.#applyStatus(id, CONTEXT_STATUS.QUEUED));
			if (added.length) this.#startPolling();
		} catch (error) {
			console.error('Failed to run configs.', error);
		}
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

	#handleAddConfig() {
		const configId = crypto.randomUUID();
		const newItem = this.#createConfigItem(configId);
		this.#saveConfigToStorage(configId, newItem.config);
	}

	#handleExportConfigs() {
		const storedConfigs = this.#getStoredConfigs();

		if (!storedConfigs || !Object.keys(storedConfigs).length) {
			notificationService.show('info', 'No configs available to export');
			return;
		}

		const date = new Date().toISOString().split('T')[0];
		const fileName = `optimization-configs_${date}.json`;
		exportConfigs(storedConfigs, fileName);

		notificationService.show('success', 'Settings exported successfully');
	}

	#handleImportConfigs() {
		this.#controlButtons.import.clickOnInput();
	}

	#handleDeleteConfigs(configIds = null) {
		const ids = configIds || Array.from(this.#configItems.keys());
		if (!ids.length) return;

		ids.forEach((configId) => this.#deleteConfig(configId));
	}

	async #handleReadyContext(contextId) {
		try {
			const response = await optimizationService.get(contextId);
			const context = Object.values(response)[0];

			const contexts =
				stateService.get(STATE_KEYS.OPTIMIZATION_CONTEXTS) || {};
			const newContexts = {
				...contexts,
				[contextId]: context,
			};

			stateService.set(STATE_KEYS.OPTIMIZATION_CONTEXTS, newContexts);

			this.#applyStatus(contextId, CONTEXT_STATUS.READY);
			this.#deleteContext(contextId);
		} catch (error) {
			console.error(`Failed to handle ready context ${contextId}.`, error);
		}
	}

	async #syncStatusesWithBackend() {
		try {
			const statuses = await optimizationService.getAllStatuses();

			await Promise.all(
				Object.entries(statuses).map(async ([id, status]) => {
					if (status !== CONTEXT_STATUS.READY) {
						this.#applyStatus(id, status);
					}

					if (status === CONTEXT_STATUS.READY) {
						await this.#handleReadyContext(id);
					} else if (status === CONTEXT_STATUS.FAILED) {
						this.#deleteContext(id);
					}
				}),
			);

			const hasProcessing = Object.values(statuses).some((s) =>
				[CONTEXT_STATUS.QUEUED, CONTEXT_STATUS.CREATING].includes(s),
			);
			if (hasProcessing) this.#startPolling();
		} catch (error) {
			console.error('Failed to sync statuses.', error);
		}
	}

	async #pollStatuses() {
		try {
			const statuses = await optimizationService.getAllStatuses();

			for (const [id, status] of Object.entries(statuses)) {
				if (status === CONTEXT_STATUS.READY) {
					await this.#handleReadyContext(id);
				}

				if (status === CONTEXT_STATUS.FAILED) {
					this.#applyStatus(id, CONTEXT_STATUS.FAILED);
					this.#deleteContext(id);
				}
			}

			const stillProcessing = Object.values(statuses).some((s) =>
				[CONTEXT_STATUS.QUEUED, CONTEXT_STATUS.CREATING].includes(s),
			);
			if (!stillProcessing) this.#stopPolling();
		} catch (error) {
			console.error('Polling failed.', error);
			this.#stopPolling();
		}
	}

	#startPolling() {
		if (this.#pollingIntervalId) return;

		this.#pollingIntervalId = setInterval(
			() => this.#pollStatuses(),
			POLLING_INTERVAL_LONG,
		);
	}

	#stopPolling() {
		if (this.#pollingIntervalId) {
			clearInterval(this.#pollingIntervalId);
			this.#pollingIntervalId = null;
		}
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

	#getConfigItemFromEvent(event) {
		const $config = $Q(event.target).closest('[data-ref="configItem"]');
		if (!$config) return null;

		const configId = $config.data('config-id');
		return this.#configItems.get(configId);
	}

	#loadStoredConfigs() {
		const storedConfigs = this.#getStoredConfigs();

		Object.entries(storedConfigs).forEach(([configId, config]) => {
			this.#createConfigItem(configId, config);
		});
	}

	#importConfigs(files) {
		if (!files || !files.length) return;

		const file = files[0];
		const reader = new FileReader();

		reader.onload = (event) => {
			try {
				const json = JSON.parse(event.target.result);
				this.#applyImportedConfig(json);
				this.#controlButtons.import.resetInput();

				notificationService.show('success', 'Settings imported successfully');
			} catch {
				notificationService.show(
					'error',
					'The file you selected is not a valid JSON settings file',
				);
			}
		};
		reader.readAsText(file);
	}

	#applyImportedConfig(json) {
		if (!json || typeof json !== 'object') return;

		const storedConfigs = this.#getStoredConfigs();

		Object.entries(json).forEach(([configId, newConfig]) => {
			if (!validateConfig(newConfig, OptimizationTab.REQUIRED_KEYS)) return;

			const existingConfig = storedConfigs[configId] || {};
			const mergedConfig = { ...existingConfig, ...newConfig };
			const existingItem = this.#configItems.get(configId);

			if (existingItem) {
				existingItem.update(mergedConfig);
			} else {
				this.#createConfigItem(configId, mergedConfig);
			}
			this.#saveConfigToStorage(configId, mergedConfig);
		});
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

	async #deleteConfig(configId) {
		const item = this.#configItems.get(configId);
		if (!item) return;

		this.#deleteContext(configId);

		item.remove();
		this.#configItems.delete(configId);
		this.#removeConfigFromStorage(configId);

		if (!this.#configItems.size) {
			this.#stopPolling();
		}
	}

	async #deleteContext(contextId) {
		try {
			const allContexts = await optimizationService.getAll();

			if (allContexts[contextId]) {
				await optimizationService.delete(contextId);
			}
		} catch (error) {
			console.error(`Failed to delete context ${contextId}.`, error);
		}
	}

	#applyStatus(configId, status) {
		const item = this.#configItems.get(configId);
		if (!item) return;

		item.clearStatus();

		if ([CONTEXT_STATUS.QUEUED, CONTEXT_STATUS.CREATING].includes(status)) {
			item.setProcessing();
		} else if (status === CONTEXT_STATUS.READY) {
			item.setSuccess();
		} else if (status === CONTEXT_STATUS.FAILED) {
			item.setError();
		}
	}

	#getStoredConfigs() {
		return storageService.getItem(STORAGE_KEYS.OPTIMIZATION_CONFIGS) || {};
	}
}
