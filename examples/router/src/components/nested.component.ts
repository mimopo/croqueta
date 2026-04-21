import { Component, css, html } from '@mimopo/croqueta';

export class NestedComponent extends Component {
  public static tag = 'app-nested';

  public static styles = css`
    .nested {
      padding-top: 1rem;
      border-top: 1px solid var(--color);
    }
  `;

  protected render(): Node {
    return html`
      <div>
        <p>Here is a nested router content:</p>
        <div class="nested">
          <croqueta-router></croqueta-router>
        </div>
      </div>
    `;
  }
}
