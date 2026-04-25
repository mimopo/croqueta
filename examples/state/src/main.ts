import { Store, StylesService, inject, registerComponent } from '@mimopo/croqueta';
import { provideStoreDevTools } from '@mimopo/croqueta/dev';

import { AppComponent } from './app.component';
import { charactersFeature } from './feature';

// Global styles are applied to all the components
import pico from '@picocss/pico/css/pico.amber.min.css?inline';
inject(StylesService).addGlobalStyles(pico);

provideStoreDevTools({
  name: 'Custom Store',
});
const store = inject(Store);
store.registerFeature(charactersFeature);

// Register the main component
registerComponent(AppComponent);
