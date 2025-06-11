import '@/styles/global.css';

import { Layout } from './components/layout/layout.component.js';
import { $Q } from './core/libs/query.lib.js';

$Q('#app').append(new Layout().render());
