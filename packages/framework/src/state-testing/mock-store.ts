import { type SignalComputed, computed } from '../reactivity';
import { type Selector, Store } from '../state';

/**
 * A mock version of the `Store` for testing purposes.
 * It extends the `Store` class and allows for overriding selectors to return
 * predefined values, which is useful for isolating components or services
 * in unit tests without needing to dispatch actions or set up a full state.
 */
export class MockStore extends Store {
  /** A map to store overridden selectors and their mock values. */
  private selectors = new Map<Selector<any>, any>();

  /**
   * @inheritdoc
   */
  public override destroy() {
    this.clearOverride();
    super.destroy();
  }

  /**
   * @inheritdoc
   */
  public override select<R>(selector: Selector<R>): SignalComputed<R> {
    if (this.selectors.has(selector)) {
      const mock = this.selectors.get(selector);
      return computed(() => mock);
    }
    return super.select(selector);
  }

  /**
   * Overrides a selector to return a specific mock value.
   * When `select` is called with this selector, it will return an observable
   * that emits the provided mock value.
   * @template T The type of the state slice selected.
   * @param selector - The selector function to override.
   * @param value - The mock value to be returned by the selector.
   */
  public overrideSelector<T>(selector: Selector<T>, value: T) {
    this.selectors.set(selector, value);
  }

  /**
   * Clears all overridden selectors, restoring the original behavior of the store.
   */
  public clearOverride() {
    this.selectors.clear();
  }
}
