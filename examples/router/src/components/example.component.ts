import { Component, html } from '@mimopo/croqueta';

export class ExampleComponent extends Component {
  public static tag = 'app-example';

  protected render(): Node {
    return html`
      <div>
        <p>This is an example component</p>
      </div>
    `;
  }
}
