import type { AnyAction } from '../state';

export interface DevToolsAction {
  type: string;
  [key: string]: any;
}

export interface DevToolsMessage {
  type: 'DISPATCH';
  payload: {
    type: 'JUMP_TO_STATE' | 'JUMP_TO_ACTION';
  };
  state: string; // JSON string
}

export interface DevToolsInstance {
  init(state: any): void;
  send(action: DevToolsAction | string, state: any): void;
  subscribe(listener: (message: DevToolsMessage) => void): () => void;
}

// The type for the result of the action or state sanitizer
type SanitizedObject = {
  // Can be any shape, but usually contains 'type' for actions or the state tree
  [key: string]: any;
};

/**
 * A function to sanitize an action object before it is sent to the Redux DevTools Extension.
 * @template A The action type.
 * @param action The action object to sanitize.
 * @param id The ID of the action (e.g., in the history).
 * @returns The sanitized action object.
 */
type ActionSanitizer<A extends AnyAction = AnyAction> = (action: A, id: number) => SanitizedObject;

/**
 * A function to sanitize the state object before it is sent to the Redux DevTools Extension.
 * @template S The state type.
 * @param state The state object to sanitize.
 * @param index The index of the state in the history.
 * @returns The sanitized state object.
 */
type StateSanitizer<S = any> = (state: S, index: number) => SanitizedObject;

/**
 * A predicate function used to conditionally send state or actions.
 * @param state The current state.
 * @param action The action being processed.
 * @returns A boolean indicating whether to send the data to the DevTools.
 */
type Predicate<S = any, A extends AnyAction = AnyAction> = (state: S, action: A) => boolean;

// --- Serialization Options ---

interface SerializationOptions {
  /**
   * The replacer function for JSON.stringify to serialize the state.
   */
  replacer?: (key: string, value: any) => any;
  /**
   * The reviver function for JSON.parse to deserialize the state.
   */
  reviver?: (key: string, value: any) => any;
}

// --- Features (Toggles) ---

interface DevToolsFeatures {
  /**
   * Toggles the 'import' feature.
   * @default true
   */
  import?: boolean;
  /**
   * Toggles the 'export' feature.
   * @default true
   */
  export?: boolean;
  /**
   * Toggles the 'jump' feature.
   * @default true
   */
  jump?: boolean;
  /**
   * Toggles the 'skip' feature.
   * @default true
   */
  skip?: boolean;
  /**
   * Toggles the 'persist' feature.
   * @default true
   */
  persist?: boolean;
  /**
   * Toggles the 'lock' feature.
   * @default true
   */
  lock?: boolean;
  /**
   * Toggles the 'test' (action generation) feature.
   * @default true
   */
  test?: boolean;
}

// --- Main Options Interface ---

/**
 * Configuration options for the Redux DevTools Extension.
 * @template S The state type of the store.
 * @template A The action type.
 */
export interface EnhancerOptions<S = any, A extends AnyAction = AnyAction> {
  /**
   * The name of the instance, displayed in the monitor's header.
   */
  name?: string;
  /**
   * The maximum allowed number of states stored in the history tree.
   * When maxAge is reached, the oldest state is discarded.
   * @default 50
   */
  maxAge?: number;
  /**
   * The delay in milliseconds before sending the next action to the monitor.
   * @default 300
   */
  latency?: number;
  /**
   * Actions to be considered as "action creators" and made dispatchable from the monitor.
   * Can be an array of string action types or an object mapping action types to functions.
   */
  actionCreators?: string[] | { [key: string]: (...args: any[]) => A };
  /**
   * A predicate function or a string/regex to filter actions (blacklist).
   * Actions matching the condition will not be sent to the monitor.
   */
  actionsExclude?: string | string[] | RegExp | RegExp[];
  /**
   * A predicate function or a string/regex to filter actions (whitelist).
   * Only actions matching the condition will be sent to the monitor.
   */
  actionsInclude?: string | string[] | RegExp | RegExp[];
  /**
   * Called to sanitize the action object before it is sent to the DevTools.
   */
  actionSanitizer?: ActionSanitizer<A>;
  /**
   * Called to sanitize the state object before it is sent to the DevTools.
   */
  stateSanitizer?: StateSanitizer<S>;
  /**
   * If set to `true`, the DevTools will try to catch and log errors in reducers or action creators.
   * @default false
   */
  shouldCatchErrors?: boolean;
  /**
   * If set to `false`, the DevTools will not try to re-evaluate the reducers on hot reloading.
   * @default true
   */
  shouldHotReload?: boolean;
  /**
   * If set to `true`, the DevTools will show the diff for each change.
   * @default false
   */
  shouldRecordChanges?: boolean;
  /**
   * If set to `true`, the DevTools will start monitoring even if the initial state is `null` or `undefined`.
   * @default false
   */
  shouldStartOnNullOrUndefinedState?: boolean;
  /**
   * Serialization options for the state and actions.
   * Can be a boolean (`true` to enable default serialization) or an object.
   */
  serialize?: boolean | SerializationOptions;
  /**
   * Whether to include stack traces for dispatched actions.
   * Can be a boolean or a function that returns a boolean.
   * @default false
   */
  trace?: boolean | (() => string | undefined);
  /**
   * The maximum number of frames to include in the stack trace.
   * @default 10
   */
  traceLimit?: number;
  /**
   * An object to selectively enable/disable specific DevTools features.
   */
  features?: DevToolsFeatures;
  /**
   * A predicate that returns `true` or `false` to conditionally send the action to the extension.
   * This overrides all other action filters if provided.
   */
  predicate?: Predicate<S, A>;
}

export interface ReduxDevtoolsOptions<S = any, A extends AnyAction = AnyAction> {
  /**
   * The name of the instance, displayed in the monitor's header.
   */
  name?: string;
  /**
   * The maximum allowed number of states stored in the history tree.
   * When maxAge is reached, the oldest state is discarded.
   * @default 50
   */
  maxAge?: number;
  /**
   * The delay in milliseconds before sending the next action to the monitor.
   * @default 300
   */
  latency?: number;
  /**
   * Actions to be considered as "action creators" and made dispatchable from the monitor.
   * Can be an array of string action types or an object mapping action types to functions.
   */
  actionCreators?: string[] | { [key: string]: (...args: any[]) => A };
  /**
   * A predicate function or a string/regex to filter actions (blacklist).
   * Actions matching the condition will not be sent to the monitor.
   */
  actionsExclude?: string | string[] | RegExp | RegExp[];
  /**
   * A predicate function or a string/regex to filter actions (whitelist).
   * Only actions matching the condition will be sent to the monitor.
   */
  actionsInclude?: string | string[] | RegExp | RegExp[];
  /**
   * Called to sanitize the action object before it is sent to the DevTools.
   */
  actionSanitizer?: ActionSanitizer<A>;
  /**
   * Called to sanitize the state object before it is sent to the DevTools.
   */
  stateSanitizer?: StateSanitizer<S>;
  /**
   * If set to `true`, the DevTools will try to catch and log errors in reducers or action creators.
   * @default false
   */
  shouldCatchErrors?: boolean;
  /**
   * If set to `false`, the DevTools will not try to re-evaluate the reducers on hot reloading.
   * @default true
   */
  shouldHotReload?: boolean;
  /**
   * If set to `true`, the DevTools will show the diff for each change.
   * @default false
   */
  shouldRecordChanges?: boolean;
  /**
   * If set to `true`, the DevTools will start monitoring even if the initial state is `null` or `undefined`.
   * @default false
   */
  shouldStartOnNullOrUndefinedState?: boolean;
  /**
   * Serialization options for the state and actions.
   * Can be a boolean (`true` to enable default serialization) or an object.
   */
  serialize?: boolean | SerializationOptions;
  /**
   * Whether to include stack traces for dispatched actions.
   * Can be a boolean or a function that returns a boolean.
   * @default false
   */
  trace?: boolean | (() => string | undefined);
  /**
   * The maximum number of frames to include in the stack trace.
   * @default 10
   */
  traceLimit?: number;
  /**
   * An object to selectively enable/disable specific DevTools features.
   */
  features?: DevToolsFeatures;
  /**
   * A predicate that returns `true` or `false` to conditionally send the action to the extension.
   * This overrides all other action filters if provided.
   */
  predicate?: Predicate<S, A>;
}

export interface ReduxDevtoolsExtension {
  connect(options?: ReduxDevtoolsOptions): DevToolsInstance;
  disconnect(): void;
}
