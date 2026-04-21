import { inject } from '../di';
import { type EffectCallback, type SignalState, signal } from '../reactivity';
import { validateEventName } from '../utils';
import { cleanup, registerEffect } from './effect';
import { StylesService } from './styles.service';
import type { ComponentConstructor, ComponentOptions, Emitter, SignalEmitter } from './types';

/**
 * Base class for all components.
 */
export abstract class Component extends HTMLElement {
  /**
   * Renders the component to the DOM.
   * @returns The node to render.
   */
  protected abstract render(): Node;
  /**
   * The root of the component.
   * Depending on the encapsulation chosen, it will be a ShadowRoot or the component itself
   */
  protected root: ShadowRoot | this;

  private options: ComponentOptions;
  private stylesService = inject(StylesService);

  constructor(options?: Partial<ComponentOptions>) {
    super();
    if (!(this.constructor as ComponentConstructor).tag) {
      throw new Error(`Component ${this.constructor.name} must have a static tag property`);
    }
    const defaults: ComponentOptions = {
      shadow: 'closed',
    };
    this.options = { ...defaults, ...options };
    this.root = this.options.shadow === 'none' ? this : this.attachShadow({ mode: this.options.shadow });
  }

  /**
   * Invoked when the custom element is first connected to the document's DOM.
   * Always call super.connectedCallback() if you override this method.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks
   */
  public connectedCallback() {
    const { styles, tag } = this.constructor as ComponentConstructor;
    this.stylesService.applyStyles(this.root, { styles, tag });
    this.root.replaceChildren(this.render());
  }

  /**
   * Invoked when the custom element is disconnected from the document's DOM.
   * Always call super.disconnectedCallback() if you override this method.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks
   */
  public disconnectedCallback() {
    cleanup(this);
    this.root?.replaceChildren();
  }

  /**
   * Registers a function to be called whenever any of the signals it reads change.
   * It automatically cleans up the effect when the component is disconnected.
   * @param effectFn The function to register.
   */
  protected effect(effectFn: EffectCallback) {
    registerEffect(this, effectFn);
  }

  /**
   * Creates a one-way binding between a property and a signal.
   * @param propName The name of the property to bind.
   * @param initialValue The initial value of the property.
   * @returns A signal that can be used to get or set the property value.
   */
  protected input<T>(propName: string, initialValue: T): SignalState<T> {
    // TODO: improve validation by avoiding same name on property and signal and avoid methods overwrite
    if (propName === 'input' || propName === 'output' || propName === 'inputOutput') {
      throw new Error(`[Framework Error]: Property "${propName}" is a reserved keyword.`);
    }
    validateEventName(propName);
    if (Object.getOwnPropertyDescriptor(this, propName)?.get) {
      throw new Error(`[Framework Error]: Property "${propName}" is already bound to a Signal.`);
    }
    let value = initialValue;
    if (this.hasOwnProperty(propName)) {
      value = (this as any)[propName];
      delete (this as any)[propName];
    }
    const s = signal(value);
    Object.defineProperty(this, propName, {
      get: () => s.get(),
      set: (v: T) => s.set(v),
      enumerable: true,
      configurable: true,
    });

    return s;
  }

  /**
   * Creates an output emitter.
   * @param eventName The name of the event to emit.
   * @returns An object with an emit method.
   */
  protected output<T>(eventName: string): Emitter<T> {
    validateEventName(eventName);
    return {
      emit: (value: T) => this.dispatchCustomEvent(eventName, value),
    };
  }

  /**
   * Creates a two-way binding between a property and a signal.
   * Use set() to only update the value internally, and emit() to update and notify parent component.
   * @param propName The name of the property to bind.
   * @param initialValue The initial value of the property.
   * @returns An object with get, set, and emit methods.
   */
  protected inputOutput<T>(propName: string, initialValue: T): SignalEmitter<T> {
    const s = this.input(propName, initialValue);
    const eventName = `${propName}-change`;
    return {
      get: () => s.get(),
      set: (v: T) => s.set(v),
      emit: (v: T) => {
        s.set(v);
        this.dispatchCustomEvent(eventName, v);
      },
    };
  }

  protected dispatchCustomEvent(eventName: string, value: unknown): void {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail: value,
        bubbles: false,
      })
    );
  }
}
