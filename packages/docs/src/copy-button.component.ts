import { Component, css, html, signal } from '@mimopo/croqueta';

/**
 * Shows a copy button and handles the icon change
 */
export class CopyButtonComponent extends Component {
  static tag = 'copy-button';

  static styles = css`
    .material-symbols-outlined {
      transition: color 0.2s ease-in-out;
    }
    .check {
      color: #00c100;
    }
  `;

  private icon = signal('content_copy');
  private timeout?: ReturnType<typeof setTimeout>;
  private copyOutput = this.output<void>('copy');

  override disconnectedCallback() {
    clearTimeout(this.timeout);
  }

  private async copy() {
    this.copyOutput.emit();
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.icon.set('check');
    this.timeout = setTimeout(() => this.icon.set('content_copy'), 2000);
  }

  protected render(): Node {
    return html`<span class="material-symbols-outlined ${this.icon}" (click)="${() => this.copy()}">${this.icon}</span>`;
  }
}
