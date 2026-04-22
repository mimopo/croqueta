import { Component, computed, html } from '@mimopo/croqueta';

export class DataComponent extends Component {
  public static tag = 'app-data';

  private messageSignal = this.input('message', '');

  protected render(): Node {
    const json = computed(() => JSON.stringify({ message: this.messageSignal.get() }, null, 2));
    return html`
      <p>This component receives data as inputs:</p>
      <pre><code>${json}</code></pre>
    `;
  }
}
