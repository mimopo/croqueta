import { Component, html } from '@mimopo/croqueta';

export class LazyComponent extends Component {
  public static tag = 'app-lazy';

  protected render(): Node {
    return html`<p>This component has been lazy loaded. Check the network tab in the devtools.</p>`;
  }
}
