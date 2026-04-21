import { Component, html } from '@mimopo/croqueta';

export class NotFoundComponent extends Component {
  public static tag = 'app-not-found';

  protected render(): Node {
    return html`
      <div>The page you are looking for does not exist.</div>
    `;
  }
}
