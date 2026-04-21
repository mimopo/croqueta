import type { SignalState } from '../reactivity';
import { Component } from './component';
import type { AttributeInput, SignalEmitter } from './types';

/**
 * Base class for componentents that meant to be used as custom elements outside the framework.
 * It provides a way to bind attributes.
 */
export abstract class WebComponent extends Component {
  private attributeHandlers: Record<string, (value: string | null) => void> = {};

  /**
   * Invoked when one of the custom element's attributes is added, removed, or changed.
   * Always call super.attributeChangedCallback() if you override this method.
   * @param name The name of the attribute.
   * @param _oldValue The old value of the attribute.
   * @param newValue The new value of the attribute.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes
   */
  public attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    this.attributeHandlers[name]?.(newValue);
  }

  /**
   * Creates an input that is bound to an attribute.
   * @param config The configuration for the input.
   * @returns A signal that can be used to get or set the input value.
   */
  protected attributeInput<T>(config: AttributeInput<T>): SignalState<T> {
    const i = this.input(config.name, config.initialValue);
    const observed = (this.constructor as any).observedAttributes;
    if (!Array.isArray(observed) || !observed.includes(config.name)) {
      throw new Error(`[Framework Error]: observedAttributes must contain "${config.name}".`);
    }
    let fromAttribute = true;
    let fromSignal = false;
    // Attribute to Signal
    this.attributeHandlers[config.name] = (value: string | null) => {
      if (fromSignal) {
        fromSignal = false;
        return;
      }
      fromAttribute = true;
      i.set(config.fromString(value));
    };
    // Signal to Attribute
    this.effect(() => {
      const v = i.get();
      if (fromAttribute) {
        fromAttribute = false;
        return;
      }
      fromSignal = true;
      const value = config.toString(v);
      if (value === null) {
        this.removeAttribute(config.name);
      } else {
        this.setAttribute(config.name, value);
      }
    });

    return i;
  }

  /**
   * Creates an input/output that is bound to an attribute.
   * @param config The configuration for the input/output.
   * @returns A signal emitter that can be used to get or set the input/output value.
   */
  protected attributeInputOutput<T>(config: AttributeInput<T>): SignalEmitter<T> {
    const s = this.attributeInput(config);
    const eventName = `${config.name}-change`;
    return {
      get: () => s.get(),
      set: (v: T) => s.set(v),
      emit: (v: T) => {
        s.set(v);
        this.dispatchCustomEvent(eventName, v);
      },
    };
  }
}
