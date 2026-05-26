import { afterEach, describe, expect, test, vi } from 'vitest';

import { destroyAllInjectors, destroyInjector, inject, injectionToken, injector, provide } from './functions';
import type { Destroy } from './types';

describe('Injector', () => {
  afterEach(() => {
    destroyAllInjectors();
  });

  test('should instantiate a non-registered service', () => {
    class NonRegisteredService {}
    const instance = inject(NonRegisteredService);
    expect(instance instanceof NonRegisteredService).toBe(true);
  });

  test('should instantiate a registered service', () => {
    class RegisteredService {}
    provide(RegisteredService);
    const instance = inject(RegisteredService);
    expect(instance instanceof RegisteredService).toBe(true);
  });

  test('should return a singleton instance', () => {
    class Service {
      static instanceCount = 0;
      constructor() {
        Service.instanceCount++;
      }
    }
    const s1 = inject(Service);
    const s2 = inject(Service);
    expect(s1).toBe(s2);
    expect(Service.instanceCount).toBe(1);
  });

  test('should handle dependencies between services', () => {
    class Service1 {
      test = () => 'Service1';
    }
    class Service2 {
      #service1 = inject(Service1);
      test = () => `Service2 and ${this.#service1.test()}`;
    }
    const s2 = inject(Service2);
    expect(s2.test()).toBe('Service2 and Service1');
  });

  test('should throw error on circular dependency - classes test', () => {
    class A {
      b = inject(B);
    }
    class B {
      a = inject(A);
    }
    expect(() => inject(A)).toThrow(/Circular dependency detected: Class A -> Class B -> Class A/);
  });

  test('should throw error on circular dependency - factory test', () => {
    const TOKEN = injectionToken('TOKEN');
    class A {
      b = inject(TOKEN);
    }

    class B {
      a;
      constructor(a: any) {
        this.a = a;
      }
    }
    const factory = () => {
      const a = inject(A);
      return new B(a);
    };
    provide(TOKEN, factory);
    expect(() => inject(A)).toThrow(/Circular dependency detected: Class A -> Token TOKEN -> Class A/);
  });

  test('should work with a factory and a token', () => {
    const TOKEN = injectionToken('TOKEN');
    class MyService {}
    const factory = () => new MyService();
    provide(TOKEN, factory);
    const instance = inject(TOKEN);
    expect(instance instanceof MyService).toBe(true);
  });

  test('should be able to replace one class with another', () => {
    class Original {}
    class Mock {}
    provide(Original, Mock);
    const instance = inject(Original);
    expect(instance instanceof Mock).toBe(true);
  });

  test('should be able to replace with the result of a factory', () => {
    class Original {
      value = 'Original';
    }
    provide(Original, () => ({
      value: 'Mock',
    }));
    const instance = inject(Original);
    expect(instance.value).toBe('Mock');
  });

  test('should throw an error if the service is not registered by its class or string token', () => {
    expect(() => provide(null as any)).toThrow(/Services must be registered by its class or injection token/);
    expect(() => provide(1 as any, () => 1)).toThrow(/Services must be registered by its class or injection token/);
    expect(() => provide(new Date() as any)).toThrow(/Constructor must be a function/);
    expect(() => provide((() => 1) as any)).toThrow(/Services must be registered by its class or injection token/);
  });

  test('should throw an error if the token to get is not a class or string token', () => {
    expect(() => inject(null as any)).toThrow(/Services must be registered by its class or injection token/);
    expect(() => inject(1 as any)).toThrow(/Services must be registered by its class or injection token/);
    expect(() => inject(new Date() as any)).toThrow(/No service found for: Token undefined/);
    expect(() => inject((() => 1) as any)).toThrow(/Services must be registered by its class or injection token/);
  });

  test('should throw an error if constructor is not a function', () => {
    const TOKEN = injectionToken('TOKEN');
    expect(() => provide(TOKEN, 'not a function' as any)).toThrow(/Constructor must be a function/);
  });

  test('should throw an error when no service for a given token', () => {
    const TOKEN = injectionToken('TOKEN');
    expect(() => inject(TOKEN)).toThrow(/No service found for: Token TOKEN/);
  });

  test('should throw an error if you try to register an already registered service', () => {
    class A {}
    provide(A);
    expect(() => provide(A)).toThrow(/Service already registered: Class A/);
  });

  test('should call destroy the services on destroy', () => {
    const spy = vi.fn<() => void>();
    class A implements Destroy {
      destroy = spy;
    }
    inject(A);
    injector().destroy();
    expect(spy).toHaveBeenCalled();
  });

  test('should throw an error if you try to destroy a non existent injector', () => {
    expect(() => destroyInjector('non-existent')).toThrow(/Injector with name "non-existent" not found/);
  });
});
