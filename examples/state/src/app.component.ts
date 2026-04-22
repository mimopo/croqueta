import { Component, Store, computed, html, inject, repeat, signal } from '@mimopo/croqueta';

import { charactersFeature } from './feature';
import type { Character } from './model';

import css from './app.component.css?inline';

/**
 * AppComponentComponent
 */
export class AppComponent extends Component {
  public static tag = 'app-root';
  public static styles = css;

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
      <div class="container-fluid">
        <header>
          <img src="https://github.com/mimopo/croqueta/raw/main/croqueta.webp" alt="Croqueta" class="logo" width="40" height="80" />
          <h1>State Example</h1>
        </header>
        <main>
          <p>Open <a href="https://github.com/reduxjs/redux-devtools">Redux DevTools</a> to inspect the state</p>

          <ul>
            ${repeat(
              this.characters,
              (c) => c.name,
              (c) => this.characterView(c)
            )}
          </ul>
          <button [disabled]="${isDisabled}" (click)="${() => this.loadCharacter()}">${buttonLabel}</button>
          <p>Data and images thanks to <a href="https://thesimpsonsapi.com/">The Simpsons API</a></p>
        </main>
      </div>
    `;
  }

  private characterView(character: Character): Node {
    return html`
      <li>
        <img src="https://cdn.thesimpsonsapi.com/200${character.portrait_path}" height="200" width="200" />
        <div>${character.name}</div>
      </li>
    `;
  }

  private loadCharacter() {
    this.store.dispatch(charactersFeature.actions.get());
  }
}
