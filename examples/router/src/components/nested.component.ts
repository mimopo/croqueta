import { Component, html } from '@mimopo/croqueta';

export class NestedComponent extends Component {
  public static tag = 'app-nested';

  protected render(): Node {
    return html`
      <p>Here is a nested router content:</p>
      <article>
        <croqueta-router></croqueta-router>
      </article>
    `;
  }
}
