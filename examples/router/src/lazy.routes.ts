import type { Route } from '@mimopo/croqueta';

import { DataComponent } from './components/data.component';

export const routes: Route[] = [
  {
    path: '/',
    data: {
      message: async () => 'Hello from lazy route',
    },
    component: DataComponent,
  },
];
