import '@/styles/global.css';

import { Layout } from './components/layout.component.js';
import { $R } from './core/libs/rquery.lib.js';

$R('#app').append(new Layout().render());
