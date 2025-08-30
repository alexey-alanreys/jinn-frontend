import { $Q } from '@/core/libs/query.lib';
import { notificationService } from '@/core/services/notification.service';
import { stateService } from '@/core/services/state.service.js';

import { Layout } from '@/components/layout/layout.component';
import { Notification } from '@/components/notification/notification.component';

import '@/styles/global.css';

import { ExecutionService } from '@/api/services/execution.service';

import { STATE_KEYS } from './constants/state-keys.constants';
import { drawingsService } from './core/services/drawings.service';
import { themeService } from './core/services/theme.service';

class AppInitializer {
	static async start() {
		try {
			const app = $Q('#app');

			this.renderNotificationShell(app);

			//
			themeService.init();
			drawingsService.init();
			await this.initializeAppState();
			//

			this.renderApp(app);
		} catch (error) {
			this.handleFatalError(error);
		}
	}

	static renderNotificationShell(app) {
		app.append(new Notification().render());
	}

	static async initializeAppState() {
		const contexts = await ExecutionService.getAll();
		const [[id, data]] = Object.entries(contexts);
		const context = { id, ...data };

		stateService.set(STATE_KEYS.CONTEXTS, contexts);
		stateService.set(STATE_KEYS.CONTEXT, context);
	}

	static renderApp(app) {
		app.append(new Layout().render());
	}

	static handleFatalError(error) {
		console.error('App initialization failed:', error);
		notificationService.show('error', 'Failed to launch the application');
	}
}

requestAnimationFrame(() => {
	AppInitializer.start();
});
