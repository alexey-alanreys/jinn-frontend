import { $Q } from '@/core/libs/query.lib';
import { drawingsService } from '@/core/services/drawings.service';
import { liveTradingService } from '@/core/services/live-trading.service';
import { stateService } from '@/core/services/state.service.js';
import { themeService } from '@/core/services/theme.service';

import { Layout } from '@/components/layout/layout.component';

import '@/styles/global.css';

import { STATE_KEYS } from '@/constants/state-keys.constants';

import { dataService } from '@/api/services/data.service';
import { ExecutionService } from '@/api/services/execution.service';

class AppInitializer {
	static async start() {
		try {
			console.log('Initializing state...');
			await this.initState();

			console.log('Initializing services...');
			this.initServices();

			console.log('Rendering app...');
			this.renderApp();

			console.log('App initialized successfully!');
		} catch (error) {
			console.error('App initialization failed:', error);
		}
	}

	static async initState() {
		const [strategies, exchanges, intervals, contexts] = await Promise.all([
			dataService.getStrategies(),
			dataService.getExchanges(),
			dataService.getIntervals(),
			ExecutionService.getAll(),
		]);

		if (!Object.keys(strategies).length) {
			throw new Error('No available strategies');
		}

		const context = Object.keys(contexts).length
			? { id: Object.keys(contexts)[0], ...Object.values(contexts)[0] }
			: {};

		stateService.set(STATE_KEYS.STRATEGIES, strategies);
		stateService.set(STATE_KEYS.EXCHANGES, exchanges);
		stateService.set(STATE_KEYS.INTERVALS, intervals);
		stateService.set(STATE_KEYS.CONTEXTS, contexts);
		stateService.set(STATE_KEYS.CONTEXT, context);
	}

	static initServices() {
		liveTradingService.init();
		drawingsService.init();
		themeService.init();
	}

	static renderApp() {
		const app = $Q('#app');
		app.append(new Layout().render());
	}
}

requestAnimationFrame(() => {
	AppInitializer.start();
});
