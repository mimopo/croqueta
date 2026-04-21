import type { Type } from '../types';
import type { Component } from './component';

/**
 * Configuration options for a Component.
 */
export interface ComponentOptions {
  /**
   * Defines the shadow DOM mode for the component.
   * 'open': Creates an open shadow root.
   * 'closed': Creates a closed shadow root. (default).
   * 'none': The component will render in the light DOM.
   */
  shadow: 'none' | 'open' | 'closed';
}

/**
 * Defines the static properties required on a Component class.
 */
export interface ComponentStatic {
  /** The custom element tag name for the component. */
  tag: string;
  /** A string of CSS styles to be applied to the component. */
  styles?: string;
}

/**
 * Represents the constructor of a Component, including its static properties.
 */
export type ComponentConstructor<T extends Component = Component> = Type<T> & ComponentStatic;

export interface SignalLike<T = unknown> {
  get(): T;
}

export interface WritableSignalLike<T = unknown> extends SignalLike<T> {
  set(value: T): void;
}

export interface RepeatResult<T> {
  type: 'repeat';
  itemsSignal: SignalLike<T[]>;
  keyFn: (item: T) => unknown;
  templateFn: (item: T) => Node;
  cache: Map<unknown, { nodes: Node[]; item: T }>;
}

export interface AttributeInput<T> {
  /** Attribute and property names */
  name: string;
  /** Initial value of the input */
  initialValue: T;
  /** Convert attribute value to signal value */
  fromString: (value: string | null) => T;
  /** Convert signal value to attribute value */
  toString: (value: T) => string | null;
}

export interface Emitter<T> {
  emit: (value: T) => void;
}

export interface SignalEmitter<T> extends WritableSignalLike<T>, Emitter<T> {}
