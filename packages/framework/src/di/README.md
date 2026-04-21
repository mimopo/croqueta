# Dependency Injection

The Dependency Injection (DI) system provides a way to manage and resolve dependencies throughout your application. It supports singleton services, factory providers, and multiple injector containers.

## Core Concepts

### Injecting Dependencies

The most common way to use DI is by injecting a class. If a class is not explicitly registered, the injector will automatically instantiate it as a singleton.

```typescript
import { inject } from '@mimopo/croqueta';

class Logger {
  log(message: string) {
    console.log(`[Log]: ${message}`);
  }
}

class UserService {
  // Dependencies are resolved automatically
  private logger = inject(Logger);

  save(user: { name: string }) {
    this.logger.log(`Saving user ${user.name}`);
  }
}

const userService = inject(UserService);
userService.save({ name: 'Miguel' });
```

### Providing Dependencies

You can explicitly provide a dependency to override a class implementation or to map a class to a factory function.

```typescript
import { provide, inject } from '@mimopo/croqueta';

class MyService {
  getData() {
    return 'raw data';
  }
}

class MockService {
  getData() {
    return 'mock data';
  }
}

// Map MyService to MockService (Singleton override)
provide(MyService, MockService);

const service = inject(MyService);
console.log(service instanceof MockService); // true
```

### Injection Tokens

Injection Tokens are useful for dependencies that don't have a class representative, such as configuration objects or interfaces. Tokens **must** be provided before they can be injected.

```typescript
import { injectionToken, provide, inject } from '@mimopo/croqueta';

interface ApiConfig {
  url: string;
  timeout: number;
}

// 1. Define a token
export const API_CONFIG = injectionToken<ApiConfig>('API_CONFIG');

// 2. Provide a value (via a factory function)
provide(API_CONFIG, () => ({
  url: 'https://api.example.com',
  timeout: 5000,
}));

// 3. Inject the token
class ApiService {
  private config = inject(API_CONFIG);

  fetch() {
    console.log(`Fetching from ${this.config.url}`);
  }
}
```

When using TypeScript you can type the injection token:

```typescript
interface ApiConfig {
  url: string;
  timeout: number;
}

// 1. Add the type when creating the token
const API_CONFIG = injectionToken<ApiConfig>('API_CONFIG');

// 2. If the factory function doesn't return a proper type the compiler will throw an error
provide(API_CONFIG, () => ({
  url: 'https://api.example.com',
  timeout: 5000,
}));

// 3. When injecting the token the compiler will infer the type
const config = inject(API_CONFIG);
```

## Advanced Usage

### Named Injectors

By default, everything is managed by the `'default'` injector. You can create isolated dependency containers using named injectors.

```javascript
import { provide, inject } from '@mimopo/croqueta';

class MyService {
  value = 'initial';
}

// Register in a specific container 'secondary'
provide(MyService, () => ({ value: 'modified' }), 'secondary');

// Retrieve from that container
const secondary = inject(MyService, 'secondary');
console.log(secondary.value); // 'modified'

// The default injector still has its own instance
const primary = inject(MyService);
console.log(primary.value); // 'initial'
```

### Cleanup

If a service implements a `destroy` method, it will be called when the injector is destroyed. This is useful for clearing subscriptions or closing connections.

```typescript
import { inject, destroyInjector, type Destroy } from '@mimopo/croqueta';

class Connection implements Destroy {
  private socket = openSocket();

  destroy() {
    this.socket.close();
    console.log('Connection closed');
  }
}

inject(Connection);

// Destroys all instances managed by 'default' and calls their destroy() methods
destroyInjector('default');
```

## API Reference

### `inject(token, injectorName?)`

Resolves a dependency for the given token.

- `token`: A class or an `InjectionToken`.
- `injectorName`: (Optional) The name of the injector to use. Defaults to `'default'`.

### `provide(token, provider?, injectorName?)`

Registers a provider for a token.

- `token`: A class or an `InjectionToken`.
- `provider`: (Optional) A class or a factory function. If omitted, the `token` itself is used as the constructor.
- `injectorName`: (Optional) The name of the injector to use.

### `injectionToken(name)`

Creates a unique token for dependency injection.

- `name`: A descriptive name for the token (used in error messages).

### `injector(name?)`

Returns the `Injector` instance for the given name.

- `name`: (Optional) The name of the injector. Defaults to `'default'`.

### `destroyInjector(name?)`

Destroys the specified injector and all its managed instances, calling `destroy()` on each if available.

### `destroyAllInjectors()`

Destroys all active injectors in the application and their managed instances. This is particularly useful for testing purposes.
