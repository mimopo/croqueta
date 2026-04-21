import { Component, Store, computed, css, html, inject, repeat, signal } from '@mimopo/croqueta';

import { charactersFeature } from './feature';
import type { Character } from './model';

/**
 * AppComponentComponent
 */
export class AppComponent extends Component {
  public static tag = 'app-root';
  public static styles = css`
    :host {
      display: block;
      padding: 1rem;
    }
    ul {
      list-style: none;
      margin: 1rem 0;
      padding: 0;
      text-align: center;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      grid-gap: 1rem;
    }
    li {
      background-color: #fff1;
      border-radius: 1rem;
      padding: 1rem;
    }
    ul,
    img {
      margin-bottom: 1rem;
    }
    button {
      display: block;
      width: 100%;
      padding: 1rem;
      font-size: 1.5rem;
      border-radius: 1rem;
      border: none;
      background-color: #fff1;
      color: #fff;
    }
    button:disabled {
      opacity: 0.5;
    }
  `;

  private store = inject(Store);
  private characters = signal<Character[]>([]);
  private status = signal('loading');

  public override connectedCallback(): void {
    super.connectedCallback();
    this.effect(() => {
      this.characters.set(this.store.select(charactersFeature.selectors.characters).get());
      this.status.set(this.store.select(charactersFeature.selectors.status).get());
    });
    this.loadCharacter();
  }

  protected render(): Node {
    const isDisabled = computed(() => this.status.get() !== 'idle');
    const buttonLabel = computed(() => (this.status.get() !== 'completed' ? 'load more' : 'no more characters'));

    return html`
      <div>
        <h1>The Simpsons characters</h1>
        <a href="https://thesimpsonsapi.com/" target="_blank">thanks to the Simpsons API</a>
        <ul>
          ${repeat(
            this.characters,
            (c) => c.name,
            (c) => this.characterView(c)
          )}
        </ul>
        <button [disabled]="${isDisabled}" (click)="${() => this.loadCharacter()}">
          ${buttonLabel}
        </button>
      </div>
    `;
  }

  private characterView(character: Character): Node {
    return html`
      <li>
        <img
          src="https://cdn.thesimpsonsapi.com/200${character.portrait_path}"
          height="200"
          width="200"
        />
        <div>${character.name}</div>
      </li>
    `;
  }

  private loadCharacter() {
    this.store.dispatch(charactersFeature.actions.get());
  }
}
