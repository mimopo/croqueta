import { Store, StylesService, css, inject, registerComponent } from '@mimopo/croqueta';
import { provideStoreDevTools } from '@mimopo/croqueta/dev';

import { AppComponent } from './app.component';
import { charactersFeature } from './feature';

import normalize from 'normalize.css?inline';

// CSS tagged template literal allows you to have css synthax highlighting in your IDE
const globalStyles = css`
  p {
    margin: 0 0 1rem 0;
  }
  pre {
    background-color: var(--background-accent-color);
    color: var(--color);
    padding: 1rem;
  }
  a {
    color: var(--link-color);
  }
`;

// Global styles are applied to all the components
inject(StylesService).addGlobalStyles(normalize, globalStyles);

provideStoreDevTools({
  name: 'Custom Store',
});
const store = inject(Store);
store.registerFeature(charactersFeature);

// Register the main component
registerComponent(AppComponent);
