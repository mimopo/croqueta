import { Signal as SignalPolyfill } from 'signal-polyfill';

export const Signal: typeof SignalPolyfill = (window as any).Signal || SignalPolyfill;
