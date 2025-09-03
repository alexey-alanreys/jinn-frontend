import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';
import { storageService } from '@/core/services/storage.service';

import { AddConfigButton } from '@/components/ui/controller/buttons/configs/add-config-button/add-config-button.component';
import { CloneConfigsButton } from '@/components/ui/controller/buttons/configs/clone-configs-button/clone-configs-button.component';
import { DeleteConfigsButton } from '@/components/ui/controller/buttons/configs/delete-configs-button/delete-configs-button.component';
import { RunConfigsButton } from '@/components/ui/controller/buttons/configs/run-configs-button/run-configs-button.component';

import { CONTEXT_STATUS } from '@/constants/context-status.constants';
import { POLLING_INTERVAL_LONG } from '@/constants/polling.constants';
import { STORAGE_KEYS } from '@/constants/storage-keys.constants';

import { optimizationService } from '@/api/services/optimization.service';

import styles from './optimization-tab.module.css';
import templateHTML from './optimization-tab.template.html?raw';

import { ConfigItem } from './config-item/config-item.component';

export class OptimizationTab extends BaseComponent {
	static COMPONENT_NAME = 'OptimizationTab';

	#$element;
	#$items;

	#controlButtons = {};
	#configItems = new Map();
	#pollingIntervalId = null;

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

	async #handleRunConfigs() {
		const configs = {};
		this.#configItems.forEach((item, id) => (configs[id] = item.config));

		if (Object.keys(configs).length === 0) return;

		const { added } = await optimizationService.add(configs);
		added.forEach((id) => this.#applyStatus(id, CONTEXT_STATUS.QUEUED));

		if (added.length > 0) this.#startPolling();
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

	async #syncStatusesWithBackend() {
		try {
			const statuses = await optimizationService.getAllStatuses();

			await Promise.all(
				Object.entries(statuses).map(async ([id, status]) => {
					this.#applyStatus(id, status);

					if (status === CONTEXT_STATUS.READY) {
						await this.#handleReadyContext(id);
					}

					if (status === CONTEXT_STATUS.FAILED) {
						this.#applyStatus(id, CONTEXT_STATUS.FAILED);
						optimizationService.delete(id).catch(() => {});
					}
				}),
			);

			const hasProcessing = Object.values(statuses).some((s) =>
				[CONTEXT_STATUS.QUEUED, CONTEXT_STATUS.CREATING].includes(s),
			);
			if (hasProcessing) this.#startPolling();
		} catch (e) {
			console.error('Failed to sync statuses.', e);
		}
	}

	async #pollStatuses() {
		try {
			const statuses = await optimizationService.getAllStatuses();

			Object.entries(statuses).forEach(([id, status]) => {
				this.#applyStatus(id, status);

				if (status === CONTEXT_STATUS.READY) {
					this.#handleReadyContext(id);
				}

				if (status === CONTEXT_STATUS.FAILED) {
					this.#applyStatus(id, CONTEXT_STATUS.FAILED);
					optimizationService.delete(id).catch(() => {});
				}
			});

			const stillProcessing = Object.values(statuses).some((s) =>
				[CONTEXT_STATUS.QUEUED, CONTEXT_STATUS.CREATING].includes(s),
			);
			if (!stillProcessing) this.#stopPolling();
		} catch (e) {
			console.error('Polling failed.', e);
			this.#stopPolling();
		}
	}

	async #handleReadyContext(contextId) {
		try {
			const contexts = await optimizationService.get(contextId);

			Object.values(contexts).forEach((context) => {
				context.params.forEach((paramSet) => {
					const newId = crypto.randomUUID();
					const newContext = { ...context, params: paramSet };
					this.#storeResult(newId, newContext);
				});
			});

			this.#applyStatus(contextId, CONTEXT_STATUS.READY);
			await this.#cleanupBackendContext(contextId);
		} catch (e) {
			console.error(`Failed to handle ready context ${contextId}.`, e);
		}
	}

	#storeResult(newId, newContext) {
		const backtestingConfigs =
			storageService.getItem(STORAGE_KEYS.BACKTESTING_CONFIGS) || {};
		backtestingConfigs[newId] = newContext;
		storageService.setItem(
			STORAGE_KEYS.BACKTESTING_CONFIGS,
			backtestingConfigs,
		);

		const tradingConfigs =
			storageService.getItem(STORAGE_KEYS.TRADING_CONFIGS) || {};
		const { start: _start, end: _end, ...rest } = newContext;
		tradingConfigs[newId] = {
			...rest,
			isLive: true,
		};
		storageService.setItem(STORAGE_KEYS.TRADING_CONFIGS, tradingConfigs);
	}

	async #cleanupBackendContext(contextId) {
		try {
			await optimizationService.delete(contextId);
		} catch (e) {
			console.warn(`Failed to cleanup context ${contextId}.`, e);
		}
	}

	#runConfig(configId) {
		const item = this.#configItems.get(configId);
		if (!item) return;

		optimizationService
			.add({ [configId]: item.config })
			.then(({ added }) => {
				if (added.includes(configId)) {
					this.#applyStatus(configId, CONTEXT_STATUS.QUEUED);
					this.#startPolling();
				}
			})
			.catch((e) => console.error('Failed to run config.', e));
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

	#deleteConfig(configId) {
		const item = this.#configItems.get(configId);

		if (item) {
			item.remove();
			this.#configItems.delete(configId);
			this.#removeConfigFromStorage(configId);
			optimizationService.delete(configId).catch(() => {});
		}

		if (this.#configItems.size === 0) {
			this.#stopPolling();
		}
	}
}
