import { BaseComponent } from '@/core/component/base.component';
import { $Q } from '@/core/libs/query.lib';
import { renderService } from '@/core/services/render.service';
import { stateService } from '@/core/services/state.service';

import { DeleteButton } from '@/components/ui/controller/buttons/common/delete-button/delete-button.component';
import { DateInput } from '@/components/ui/controller/inputs/date-input/date-input.component';
import { SelectInput } from '@/components/ui/controller/inputs/select-input/select-input.component';
import { TextInput } from '@/components/ui/controller/inputs/text-input/text-input.component';

import { STATE_KEYS } from '@/constants/state-keys.constants';

import styles from './config-item.module.css';
import templateHTML from './config-item.template.html?raw';

export class ConfigItem extends BaseComponent {
	static COMPONENT_NAME = 'ConfigItem';
	static PLACEHOLDER = 'BTCUSDT';

	#$element;

	#configId = null;
	#config = {
		strategy: null,
		exchange: null,
		interval: null,
		symbol: null,
		start: null,
		end: null,
	};
	#dataFields = new Map();

	get config() {
		return this.#config;
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
		this.#config = config;
		this.#updateDOM();
		this.#syncConfigHeader();
	}

	remove() {
		this.element.remove();
	}

	toggle() {
		const isActive = this.#$element.is('data-active');
		this.#$element.data('active', String(!isActive));
	}

	handleClick(event) {
		const $selectInput = $Q(event.target).closest('[data-ref="selectInput"]');
		if (!$selectInput) {
			this.strategyInput.close();
			this.exchangeInput.close();
			this.intervalInput.close();
			return;
		}

		const key = $selectInput.closest('[data-key]').data('key');
		let targetInput = null;

		switch (key) {
			case 'strategyInput':
				targetInput = this.strategyInput;
				break;
			case 'exchangeInput':
				targetInput = this.exchangeInput;
				break;
			case 'intervalInput':
				targetInput = this.intervalInput;
		}

		const ref = $Q(event.target).closest('[data-ref]').data('ref');
		console.log(ref);

		if (ref === 'value' || ref === 'trigger') {
			targetInput.toggle();
			return;
		}

		if (ref === 'option') {
			const value = $Q(event.target).closest('[data-ref]').data('value');
			targetInput.update(value);
			targetInput.close();
		}
	}

	#initComponents() {
		const strategies = stateService.get(STATE_KEYS.STRATEGIES);
		const exchanges = stateService.get(STATE_KEYS.EXCHANGES);
		const intervals = stateService.get(STATE_KEYS.INTERVALS);

		this.strategyInput = new SelectInput({
			options: Object.keys(strategies),
		});
		this.exchangeInput = new SelectInput({
			options: exchanges,
		});
		this.intervalInput = new SelectInput({
			options: intervals,
		});
		this.symbolInput = new TextInput({ placeholder: ConfigItem.PLACEHOLDER });
		this.startInput = new DateInput();
		this.endInput = new DateInput();
	}

	#initDOM() {
		this.element = renderService.htmlToElement(
			templateHTML,
			[new DeleteButton({ title: 'Delete Setting' })],
			styles,
		);
		this.#$element = $Q(this.element);
	}

	#setupInitialState() {
		this.#$element.data('config-id', this.#configId);

		this.#$element.findAll('[data-field]').forEach((el) => {
			const key = el.data('field');
			this.#dataFields.set(key, { element: el });
		});

		this.#renderInitialItems();
		this.#syncConfig();
		this.#syncConfigHeader();
	}

	#renderInitialItems() {
		const $strategyInput = this.#$element.find('[data-ref="strategyInput"]');
		const $exchangeInput = this.#$element.find('[data-ref="exchangeInput"]');
		const $intervalInput = this.#$element.find('[data-ref="intervalInput"]');
		const $symbolInput = this.#$element.find('[data-ref="symbolInput"]');
		const $startInput = this.#$element.find('[data-ref="startInput"]');
		const $endInput = this.#$element.find('[data-ref="endInput"]');

		$strategyInput.append(this.strategyInput.render());
		$exchangeInput.append(this.exchangeInput.render());
		$intervalInput.append(this.intervalInput.render());
		$symbolInput.append(this.symbolInput.render());
		$startInput.append(this.startInput.render());
		$endInput.append(this.endInput.render());

		$strategyInput.data('key', 'strategyInput');
		$exchangeInput.data('key', 'exchangeInput');
		$intervalInput.data('key', 'intervalInput');
	}

	#updateDOM() {
		this.strategyInput.update(this.#config.strategy);
		this.exchangeInput.update(this.#config.exchange);
		this.intervalInput.update(this.#config.interval);
		this.symbolInput.update(this.#config.symbol);
		this.startInput.update(this.#config.start);
		this.endInput.update(this.#config.end);
	}

	#syncConfig() {
		this.#config = {
			strategy: this.strategyInput.value,
			exchange: this.exchangeInput.value,
			interval: this.intervalInput.value,
			symbol: this.symbolInput.value || ConfigItem.PLACEHOLDER,
			start: this.startInput.value,
			end: this.endInput.value,
		};
	}

	#syncConfigHeader() {
		this.#dataFields.forEach(({ element }, key) => {
			element.text(this.#config[key]);
		});
	}
}
