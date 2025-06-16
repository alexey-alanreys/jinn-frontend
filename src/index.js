import '@/styles/global.css';

import { Layout } from './components/layout/layout.component';
import { $Q } from './core/libs/query.lib';

$Q('#app').append(new Layout().render());
