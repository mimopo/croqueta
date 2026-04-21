import { Injector } from './injector';
import type { InjectionFactory, InjectionKey, InjectionToken } from './types';

const injectors = new Map<string, Injector>();

/**
 * Retrieves an existing injector by name or creates a new one if it doesn't exist.
 *
 * @param name - The name of the injector to retrieve or create. Defaults to 'default'.
 * @returns The requested Injector instance.
 */
export function injector(name = 'default'): Injector {
  const stored = injectors.get(name);
  if (stored) {
    return stored;
  }
  const created = new Injector();
  injectors.set(name, created);
  return created;
}

/**
 * Resolves and returns an instance of the registered dependency.
 *
 * @param token - The token or class to resolve.
 * @param injectorName - The name of the injector to use. Defaults to 'default'.
 * @returns The resolved instance.
 * @throws {Error} If a circular dependency is detected or the constructor is not a function.
 */
export function inject<T>(token: InjectionKey<T>, injectorName?: string): T {
  return injector(injectorName).get(token);
}

/**
 * Registers a dependency with the injector. Regular classes doesn't need to be registered.
 *
 * @param token - The unique token or class to register.
 * @param constructor - The constructor function for the dependency. If omitted, the token itself is used as the constructor.
 * @param injectorName - The name of the injector to use. Defaults to 'default'.
 * @throws {Error} If the token is not provided or the constructor is not a function.
 */
export function provide<T>(token: InjectionKey<T>, constructor?: InjectionFactory<T>, injectorName?: string) {
  return injector(injectorName).register(token, constructor);
}

/**
 * Destroys an existing injector by name and removes it from the registry.
 *
 * @param name - The name of the injector to destroy. Defaults to 'default'.
 * @throws {Error} If the injector with the specified name is not found.
 */
export function destroyInjector(name = 'default') {
  const stored = injectors.get(name);
  if (!stored) {
    throw new Error(`Injector with name "${name}" not found`);
  }
  stored.destroy();
  injectors.delete(name);
}

/**
 * Destroys all injectors and removes them from the registry.
 */
export function destroyAllInjectors() {
  for (const name of injectors.keys()) {
    destroyInjector(name);
  }
}

export function injectionToken<T>(name: string) {
  return {
    id: name,
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion - This is a type guard to be able to infer the type
    _type: undefined as T,
  } as InjectionToken<T>;
}
