import type { Type } from '../types';
import type { Component } from './component';
import type { RepeatResult, SignalLike, WritableSignalLike } from './types';

/**
 * Registers a component class as a custom element in the browser.
 * This function is idempotent; it will not throw an error if the
 * component is already registered with the same tag.
 *
 * @param type The component class to register. It must have a static `tag` property.
 */
export function registerComponent(type: Type<Component> & { tag: string }) {
  if (customElements.get(type.tag)) return;
  customElements.define(type.tag, type);
}

export function isSignal(val: unknown): val is SignalLike {
  return typeof val === 'object' && val !== null && 'get' in val && typeof val.get === 'function';
}

export function isWritableSignal(val: unknown): val is WritableSignalLike {
  if (!isSignal(val)) {
    return false;
  }
  return 'set' in val && typeof val.set === 'function';
}

export function isRepeat(val: unknown): val is RepeatResult<unknown> {
  return typeof val === 'object' && val !== null && 'type' in val && val.type === 'repeat';
}
