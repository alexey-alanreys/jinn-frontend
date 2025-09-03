import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';
import { stateService } from '@/core/services/state.service';

import { DeleteButton } from '@/components/ui/controller/buttons/common/delete-button/delete-button.component';
import { RunButton } from '@/components/ui/controller/buttons/common/run-button/run-button.component';
import { DateInput } from '@/components/ui/controller/inputs/date-input/date-input.component';
import { SelectInput } from '@/components/ui/controller/inputs/select-input/select-input.component';
import { TextInput } from '@/components/ui/controller/inputs/text-input/text-input.component';

import { STATE_KEYS } from '@/constants/state-keys.constants';

import styles from './config-item.module.css';
import templateHTML from './config-item.template.html?raw';

export class ConfigItem extends BaseComponent {
	static COMPONENT_NAME = 'ConfigItem';
	static DEFAULT_SYMBOL = 'BTCUSDT';

	#$element;
	#configId;

	#config = {
		strategy: null,
		symbol: null,
		interval: null,
		exchange: null,
		start: null,
		end: null,
	};
	#inputs = {};
	#headerFields = new Map();

	get configId() {
		return this.#configId;
	}

	get config() {
		return { ...this.#config };
	}

	constructor({ configId }) {
		super();
		this.#configId = configId;
	}

	render() {
		this.#initComponents();
		this.#initDOM();
		this.#setupInitialState();
		return this.element;
	}

	update(config) {
		this.#config = { ...config };

		this.#updateInputValues();
		this.#updateHeaderDisplay();
	}

	remove() {
		this.element.remove();
	}

	toggle() {
		const isActive = this.#$element.data('active') === 'true';
		this.#$element.data('active', String(!isActive));
	}

	handleChange(event) {
		const inputKey = this.#getInputKeyFromEvent(event);
		if (!inputKey) return;

		const input = this.#inputs[inputKey];
		const newValue = input.value;

		if (this.#isValidInput(inputKey)) {
			input.commit(newValue);

			this.#updateConfigProperty(inputKey, newValue);
			this.#updateHeaderDisplay();
		} else {
			input.rollback();
		}
	}

	handleClick(event) {
		const $selectInput = $Q(event.target).closest('[data-ref="selectInput"]');

		if (!$selectInput) {
			this.#closeAllSelectInputs();
			return;
		}

		const inputKey = this.#getInputKeyFromEvent(event);
		const targetInput = this.#inputs[inputKey];
		if (!targetInput) return;

		const $clickedElement = $Q(event.target).closest('[data-ref]');
		const ref = $clickedElement.data('ref');

		if (ref === 'value' || ref === 'trigger') {
			targetInput.toggle();
			return;
		}

		if (ref === 'option') {
			const selectedValue = $clickedElement.data('value');
			targetInput.update(selectedValue);
			targetInput.close();

			this.#updateConfigProperty(inputKey, selectedValue);
			this.#updateHeaderDisplay();
		}
	}

	setProcessing() {
		this.#$element.data('status', 'processing');
	}

	setSuccess() {
		this.#$element.data('status', 'success');
	}

	setError() {
		this.#$element.data('status', 'error');
	}

	clearStatus() {
		this.#$element.data('status', '');
	}

	#initComponents() {
		const appState = {
			strategies: stateService.get(STATE_KEYS.STRATEGIES),
			exchanges: stateService.get(STATE_KEYS.EXCHANGES),
			intervals: stateService.get(STATE_KEYS.INTERVALS),
		};

		this.#inputs = {
			strategy: new SelectInput({ options: Object.keys(appState.strategies) }),
			symbol: new TextInput({ placeholder: ConfigItem.DEFAULT_SYMBOL }),
			interval: new SelectInput({ options: appState.intervals }),
			exchange: new SelectInput({ options: appState.exchanges }),
			start: new DateInput(),
			end: new DateInput(),
		};
	}

	#initDOM() {
		this.element = renderService.htmlToElement(
			templateHTML,
			[
				new RunButton({ title: 'Run Setting' }),
				new DeleteButton({ title: 'Delete Setting' }),
			],
			styles,
		);
		this.#$element = $Q(this.element);
	}

	#setupInitialState() {
		this.#$element.data('config-id', this.#configId);

		this.#mapHeaderFields();
		this.#renderInputComponents();
		this.#syncConfigFromInputs();
		this.#updateHeaderDisplay();
	}

	#mapHeaderFields() {
		this.#$element.findAll('[data-field]').forEach((el) => {
			const fieldKey = el.data('field');
			this.#headerFields.set(fieldKey, el);
		});
	}

	#renderInputComponents() {
		const inputContainers = {
			strategy: this.#$element.find('[data-ref="strategyInput"]'),
			symbol: this.#$element.find('[data-ref="symbolInput"]'),
			interval: this.#$element.find('[data-ref="intervalInput"]'),
			exchange: this.#$element.find('[data-ref="exchangeInput"]'),
			start: this.#$element.find('[data-ref="startInput"]'),
			end: this.#$element.find('[data-ref="endInput"]'),
		};

		Object.entries(inputContainers).forEach(([key, $container]) => {
			$container.append(this.#inputs[key].render());
			$container.data('key', key);
		});
	}

	#syncConfigFromInputs() {
		Object.keys(this.#config).forEach((key) => {
			this.#config[key] = this.#inputs[key]?.value ?? null;
		});
	}

	#updateHeaderDisplay() {
		this.#headerFields.forEach((element, fieldKey) => {
			const value = this.#config[fieldKey];

			if (fieldKey === 'symbol' && (!value || value === '')) {
				element.text('[No Symbol]');
			} else if (value) {
				element.text(value);
			}
		});
	}

	#updateInputValues() {
		Object.entries(this.#config).forEach(([key, value]) => {
			const input = this.#inputs[key];

			if (input && value !== null) {
				input.update(value);
			}
		});
	}

	#updateConfigProperty(key, value) {
		this.#config[key] = value ?? null;
	}

	#getInputKeyFromEvent(event) {
		const $container = $Q(event.target).closest('[data-key]');
		return $container?.data('key') ?? null;
	}

	#isValidInput(inputKey) {
		return this.#inputs[inputKey].isValid?.() ?? true;
	}

	#closeAllSelectInputs() {
		['strategy', 'exchange', 'interval'].forEach((key) => {
			this.#inputs[key].close();
		});
	}
}
