import type { Type } from '../types';
import type { InjectionFactory, InjectionKey, InjectionToken } from './types';

/**
 * Dependency Injection container for registering and resolving dependencies.
 *
 * @class Injector
 * @hideconstructor
 * @example
 * class GreeterService {
 *   #session = injector().get(SessionService);
 *   greet = () => `Hello ${this.#session.getUserName()}!`;
 * }
 * class SessionService {
 *   getUserName = () => 'Miguel';
 * }
 * const greeter = injector().get(GreeterService);
 * console.log(greeter.greet()); // 'Hello Miguel!'
 */
export class Injector {
  private declarations = new Map<InjectionKey<any>, InjectionFactory<any>>();
  private instances = new Map<InjectionKey<any>, any>();
  private resolving = new Set<InjectionKey<any>>();

  /**
   * Registers a dependency with the injector. Regular classes doesn't need to be registered.
   *
   * @param token - The unique token or class to register.
   * @param constructor - The constructor function for the dependency. If omitted, the token itself is used as the constructor.
   * @throws {Error} If the token is not provided or the constructor is not a function.
   */
  public register<T>(token: InjectionKey<T>, constructor?: InjectionFactory<T>) {
    this.validateToken(token);
    const c = constructor ?? token;
    if (typeof c !== 'function') {
      throw new Error('Constructor must be a function');
    }
    if (this.declarations.has(token)) {
      throw new Error(`Service already registered: ${this.format(token)}`);
    }
    this.declarations.set(token, c);
  }

  /**
   * Resolves and returns an instance of the registered dependency.
   *
   * @param token - The token or class to resolve.
   * @returns The resolved instance.
   * @throws {Error} If a circular dependency is detected or the constructor is not a function.
   */
  public get<T>(token: InjectionKey<T>): T {
    this.validateToken(token);
    if (this.instances.has(token)) {
      return this.instances.get(token);
    }
    if (this.resolving.has(token)) {
      const circularDeps = [...this.resolving, token].map((dep) => this.format(dep)).join(' -> ');
      throw new Error(`Circular dependency detected: ${circularDeps}`);
    }
    this.resolving.add(token);
    const c = this.declarations.get(token) ?? token;
    if (typeof c !== 'function') {
      throw new Error(`No service found for: ${this.format(token)}`);
    }
    const instance = this.isClass(c) ? new c() : c();
    this.resolving.delete(token);
    this.instances.set(token, instance);
    return instance;
  }

  /**
   * Resets the injector by clearing anything registered
   * @internal
   */
  public destroy() {
    for (const [, instance] of this.instances) {
      if (typeof instance === 'object') {
        instance?.destroy?.();
      }
    }
    this.instances.clear();
    this.resolving.clear();
    this.declarations.clear();
  }

  private isClass(value: unknown): value is Type<any> {
    return !!(typeof value === 'function' && value?.prototype?.constructor);
  }

  private validateToken(token: InjectionToken<any> | Type<any>) {
    if (!token || (!this.isClass(token) && typeof token !== 'object')) {
      throw new Error('Services must be registered by its class or injection token');
    }
  }

  private format(s: InjectionToken<any> | Type<any>) {
    if (typeof s === 'object') {
      return `Token ${s.id}`;
    }
    return `Class ${s.name}`;
  }
}
