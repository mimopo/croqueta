# Reactivity

The reactivity system is the core of _Croqueta's_ state management. It's based on the **[TC39 Signals proposal](https://github.com/tc39/proposal-signals)**, providing a modern, efficient, and standard-aligned way to handle state and side effects.

Croqueta's reactivity is fine-grained, meaning that only the parts of your application that actually depend on a specific piece of state will re-run when that state changes.

## Core Concepts

### Signals

A `signal` is the most basic building block of reactivity. It holds a single value that can change over time. When you update a signal, any computations or effects that depend on it are automatically notified.

```javascript
import { signal } from '@mimopo/croqueta';

// Create a signal with an initial value
const count = signal(0);

// Get the current value
console.log(count.get()); // 0

// Update the value
count.set(1);
console.log(count.get()); // 1
```

### Computed Signals

A `computed` signal is a derived value that automatically updates when any of its dependencies (other signals or other computed signals) change. Computed signals are lazily evaluated and cached for efficiency.

```javascript
import { signal, computed } from '@mimopo/croqueta';

const count = signal(2);
const doubled = computed(() => count.get() * 2);

console.log(doubled.get()); // 4

count.set(5);
console.log(doubled.get()); // 10
```

### Effects

An `effect` is a side effect that automatically runs whenever its dependencies change. Effects are asynchronous by default, meaning they are scheduled to run in the next microtask after a signal changes, batching multiple state updates together.

Effects can optionally return a cleanup function that will be called before the effect re-runs or when the effect is disposed.

```javascript
import { signal, effect } from '@mimopo/croqueta';

const count = signal(0);

// Create an effect
const stop = effect(() => {
  console.log(`The count is: ${count.get()}`);

  // Optional: return a cleanup function
  return () => {
    console.log('Cleaning up before re-running or disposing...');
  };
});

// Logs: "The count is: 0"

count.set(1);
// Logs (after a microtask):
// "Cleaning up before re-running or disposing..."
// "The count is: 1"

// Stop the effect from running again
stop();
```

## Advanced Usage

### Readonly Signals

To maintain a clean data flow, you might want to expose a signal as read-only to other parts of your application. `readonly()` creates a computed signal that simply reflects the value of the original state signal.

```javascript
import { signal, readonly } from '@mimopo/croqueta';

const originalSignal = signal('Hello');
const readonlySignal = readonly(originalSignal);

console.log(readonlySignal.get()); // "Hello"

// readonlySignal.set('Bye'); // Error: .set is not a function
```

## API Reference

### `signal(initialValue)`

Creates a new `Signal.State`.

- `get()`: Returns the current value and tracks it as a dependency in computed signals and effects.
- `set(value)`: Updates the value and notifies dependencies.

### `computed(factoryFunction)`

Creates a new `Signal.Computed`.

- `get()`: Returns the current derived value, recomputing it only if dependencies have changed.

### `effect(callback)`

Creates a reactive effect.

- `callback`: Function to execute. Can return a cleanup function.
- Returns: A `dispose()` function to stop the effect.

### `readonly(signal)`

Wraps a state signal into a computed signal to prevent external modifications.
