import { Component, computed, css, html, inject, registerComponent, repeat, signal } from '@mimopo/croqueta';

import { CopyButtonComponent } from './copy-button.component';
import { TabSyncService } from './tab-sync.service';

/**
 * Shows copy button and language selector tabs
 */
export class CodeGroupComponent extends Component {
  static tag = 'croqueta-code-group';

  static styles = css`
    :host {
      position: relative;
      display: block;
    }
    .actions {
      position: absolute;
      top: 0;
      right: 0;
      background-color: #00000050;
      border-radius: 0 var(--pico-border-radius);
    }
    .button {
      display: block;
      cursor: pointer;
      border: none;
      background: transparent;
      color: #ffffff80;
      text-align: center;
      width: 1.5rem;
    }
    .button:hover {
      color: #fff;
    }

    button.active {
      text-decoration: underline;
    }
    button {
      text-transform: uppercase;
      padding: 0.5em 0.2em;
      font-weight: bolder;
    }
  `;

  private active = signal('');
  private languages: Map<string, Element>;
  private tabSync = inject(TabSyncService);

  constructor() {
    super({ shadow: 'open' });
    this.languages = this.getLanguages();
    this.active.set(this.languages.keys().next().value ?? '');
    this.effect(() => {
      const language = this.tabSync.active.get();
      if (this.active.get() !== language && this.languages.has(language)) {
        this.active.set(language);
      }
    });
    registerComponent(CopyButtonComponent);
  }

  private getLanguages() {
    const languages = new Map<string, Element>();
    for (const slot of this.querySelectorAll('[slot]').values()) {
      const name = slot.getAttribute('slot');
      if (!name) continue;
      languages.set(name, slot);
    }
    return languages;
  }

  private async copy(language: string) {
    const code = this.languages.get(language)?.querySelector('pre')?.innerText;
    if (!code) {
      return;
    }
    await navigator.clipboard.writeText(code);
  }

  private change(language: string) {
    this.active.set(language);
    this.tabSync.active.set(language);
  }

  protected render(): Node {
    // const code = computed(() => this.languages.get(this.active.get()));
    return html`
      <div class="actions">
        <copy-button class="button" title="copy code" (copy)="${() => this.copy(this.active.get())}"></copy-button>
        ${repeat(
          computed(() => {
            if (this.languages.size === 1) return [];
            const languages = Array.from(this.languages.keys()).map((language) => {
              return {
                cssClass: this.active.get() === language ? 'active' : '',
                language,
              };
            });
            return languages;
          }),
          (i) => i,
          ({ language, cssClass }) => {
            return html`<button class="button ${cssClass}" (click)="${() => this.change(language)}" title="view ${language} code">
              ${language}
            </button>`;
          }
        )}
      </div>
      <slot name="${this.active}"></slot>
    `;
  }
}
