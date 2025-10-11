# HMR: hot.js

The `hot.js` module provides a powerful set of utilities for creating hot-module-reload (HMR) compatible modules. This is an advanced feature for library authors who want to build stateful modules that don't lose their state when the file is updated during development.

When used in a Vite environment, it preserves the identity of functions, classes, and factory-produced objects across reloads.

## API

To use the module, you first create an instance of the API by passing it the `import.meta` object.

```javascript
import { moduleState } from '@3sln/bones/hot';
const { pub, once, factory } = moduleState(import.meta);

// Tell Vite that this module can handle HMR
import.meta.hot?.accept();
```

### `pub(thing)`

Publishes a class or function, preserving its identity across reloads. The `thing` must be an object or function.

```javascript
export const MyClass = pub(class MyClass {
  // ...
});
```

### `once(fn)`

Ensures a function is only ever executed once across the entire lifecycle of the application, even with HMR reloads. This is useful for initializing singletons or other expensive, one-time setup.

```javascript
const mySingleton = once(() => new MySingleton());
```

### `factory(factoryFn)`

Wraps a `bones`-style factory function. This is the most complex part of the module. It ensures that API objects produced by the factory are hot-swapped on reload.

When you call a `factory`-wrapped function, the returned API object is a proxy. The first time you access any property on that proxy after a reload, the wrapper will automatically re-run the new factory function with the original arguments and seamlessly swap the underlying implementation.

It also provides an `AbortSignal` in the `this` context of the factory, which will be aborted just before the factory is re-run, allowing you to clean up any side effects.

```javascript
function myApiFactory(settings) {
  // `this` is the HMR context
  this.signal.addEventListener('abort', () => console.log('Cleaning up!'));
  
  // ... factory logic ...
  return { /* ... api ... */ };
}

export default factory(myApiFactory);
```
