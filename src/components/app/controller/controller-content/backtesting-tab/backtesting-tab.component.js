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
import { POLLING_INTERVAL_SHORT } from '@/constants/polling.constants';
import { STATE_KEYS } from '@/constants/state-keys.constants';
import { STORAGE_KEYS } from '@/constants/storage-keys.constants';

import { exportConfigs } from '@/utils/export-configs.util';
import { validateConfig } from '@/utils/validate-config.util';

import { executionService } from '@/api/services/execution.service';

import styles from './backtesting-tab.module.css';
import templateHTML from './backtesting-tab.template.html?raw';

import { ConfigItem } from './config-item/config-item.component';

export class BacktestingTab extends BaseComponent {
	static COMPONENT_NAME = 'BacktestingTab';
	static REQUIRED_KEYS = [
		'strategy',
		'symbol',
		'interval',
		'exchange',
		'params',
		'start',
		'end',
	];

	#$element;
	#$items;

	#controlButtons = {};
	#pollingIntervalId = null;
	#configItems = new Map();
	#runningContextIds = new Set();
	#knownContextIds = {
		optimization: new Set(),
		execution: new Set(),
	};

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
		this.#attachListeners();
		await this.#syncStatusesWithBackend();
	}

	#attachListeners() {
		this.#$element.on('change', this.#handleChange.bind(this));
		this.#$element.on('click', this.#handleClick.bind(this));

		stateService.subscribe(
			STATE_KEYS.EXECUTION_CONTEXTS,
			this.#handleExecutionContextsUpdate.bind(this),
		);
		stateService.subscribe(
			STATE_KEYS.OPTIMIZATION_CONTEXTS,
			this.#handleOptimizationContextsUpdate.bind(this),
		);
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
			openButton: () => this.#handleChangeContext(configItem.configId),
			deleteButton: () => this.#handleDeleteConfigs([configItem.configId]),
		};

		if (itemHandlers[ref]) {
			itemHandlers[ref]();
		} else {
			configItem.handleClick(event);
			this.#saveConfigToStorage(configItem.configId, configItem.config);
		}
	}

	#handleExecutionContextsUpdate(contexts) {
		Array.from(this.#knownContextIds.execution).forEach((contextId) => {
			if (!(contextId in contexts)) {
				const item = this.#configItems.get(contextId);
				if (item) item.clearStatus();
				this.#knownContextIds.execution.delete(contextId);
			}
		});

		Object.keys(contexts).forEach((contextId) => {
			this.#knownContextIds.execution.add(contextId);
		});
	}

	#handleOptimizationContextsUpdate(contexts) {
		const backtestingConfigs =
			storageService.getItem(STORAGE_KEYS.BACKTESTING_CONFIGS) || {};

		Object.entries(contexts).forEach(([contextId, context]) => {
			if (this.#knownContextIds.optimization.has(contextId)) return;

			context.params.forEach((paramSet) => {
				const newId = crypto.randomUUID();
				const newConfig = { ...context, params: paramSet };

				backtestingConfigs[newId] = newConfig;
				this.#createConfigItem(newId, newConfig);
			});

			this.#knownContextIds.optimization.add(contextId);
		});

		storageService.setItem(
			STORAGE_KEYS.BACKTESTING_CONFIGS,
			backtestingConfigs,
		);
	}

	async #handleRunConfigs(configIds) {
		const ids = configIds || Array.from(this.#configItems.keys());
		if (!ids.length) return;

		const configs = {};
		ids.forEach((id) => (configs[id] = this.#configItems.get(id).config));

		try {
			const { added } = await executionService.add(configs);

			added.forEach((id) => {
				this.#applyStatus(id, CONTEXT_STATUS.QUEUED);
				this.#runningContextIds.add(id);
			});

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
		const fileName = `backtesting-configs_${date}.json`;
		exportConfigs(storedConfigs, fileName);

		notificationService.show('success', 'Settings exported successfully');
	}

	#handleImportConfigs() {
		this.#controlButtons.import.clickOnInput();
	}

	#handleDeleteConfigs(configIds) {
		const ids = configIds || Array.from(this.#configItems.keys());
		if (!ids.length) return;

		ids.forEach((configId) => this.#deleteConfig(configId));
	}

	async #handleReadyContext(contextId) {
		try {
			const currentContexts = stateService.get(STATE_KEYS.EXECUTION_CONTEXTS);
			const newContext = await executionService.get(contextId);

			const updatedContexts = { ...currentContexts, ...newContext };
			stateService.set(STATE_KEYS.EXECUTION_CONTEXTS, updatedContexts);

			this.#applyStatus(contextId, CONTEXT_STATUS.READY);
		} catch (error) {
			console.error(`Failed to handle ready context ${contextId}.`, error);
		}
	}

	#handleChangeContext(contextId) {
		const contexts = stateService.get(STATE_KEYS.EXECUTION_CONTEXTS);

		if (!contexts[contextId]) {
			notificationService.show(
				'warning',
				'Strategy not created or was deleted',
			);
			return;
		}

		const currentContext = stateService.get(STATE_KEYS.EXECUTION_CONTEXT);
		if (currentContext.id === contextId) return;

		const newContext = contexts[contextId];
		stateService.set(STATE_KEYS.EXECUTION_CONTEXT, {
			id: contextId,
			...newContext,
		});
	}

	async #syncStatusesWithBackend() {
		try {
			const statuses = await executionService.getAllStatuses();

			await Promise.all(
				Object.entries(statuses).map(async ([id, status]) => {
					this.#applyStatus(id, status);
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
			if (!this.#runningContextIds.size) {
				this.#stopPolling();
				return;
			}

			for (const contextId of Array.from(this.#runningContextIds)) {
				const { status } = await executionService.getStatus(contextId);

				if (status === CONTEXT_STATUS.READY) {
					await this.#handleReadyContext(contextId);
					this.#runningContextIds.delete(contextId);
				} else if (status === CONTEXT_STATUS.FAILED) {
					this.#applyStatus(contextId, CONTEXT_STATUS.FAILED);
					this.#runningContextIds.delete(contextId);
				}
			}

			if (!this.#runningContextIds.size) this.#stopPolling();
		} catch (error) {
			console.error('Polling failed.', error);
			this.#stopPolling();
		}
	}

	#startPolling() {
		if (this.#pollingIntervalId) return;

		this.#pollingIntervalId = setInterval(
			() => this.#pollStatuses(),
			POLLING_INTERVAL_SHORT,
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
			if (!validateConfig(newConfig, BacktestingTab.REQUIRED_KEYS)) return;

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
		storageService.setItem(STORAGE_KEYS.BACKTESTING_CONFIGS, storedConfigs);
	}

	#removeConfigFromStorage(configId) {
		const storedConfigs = this.#getStoredConfigs();
		delete storedConfigs[configId];
		storageService.setItem(STORAGE_KEYS.BACKTESTING_CONFIGS, storedConfigs);
	}

	async #deleteConfig(configId) {
		const item = this.#configItems.get(configId);
		if (!item) return;

		item.remove();
		this.#configItems.delete(configId);
		this.#removeConfigFromStorage(configId);

		if (!this.#configItems.size) {
			this.#stopPolling();
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
		return storageService.getItem(STORAGE_KEYS.BACKTESTING_CONFIGS) || {};
	}
}
