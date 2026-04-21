import { Signal as SignalPolyfill } from 'signal-polyfill';

export type SignalState<T> = SignalPolyfill.State<T>;
export type SignalComputed<T> = SignalPolyfill.Computed<T>;
// The cleanup function type (what the user returns)
export type EffectCleanup = () => void;

// The effect callback can return a cleanup function or nothing
export type EffectCallback = () => EffectCleanup | void | Promise<void>;
