# Introduction to @3sln/bones

`@3sln/bones` is a "batteries-included" utility library for the `@3sln/dodo` virtual DOM engine. It provides a collection of reactive components and utilities to help build complex, state-driven user interfaces.

## Core Philosophy

The entire library is built around a few core principles:

1.  **Factory-Based Architecture**: Every module in `bones` exports a factory function as its default export. You don't import components directly; you create an API instance by calling the factory.

2.  **Dependency Injection**: To ensure there is only one "source of truth" for the UI engine, every factory **must** be instantiated with a `dodo` API instance. This prevents versioning conflicts and ensures all `bones` components use the same `dodo` instance as your application.

3.  **Caching**: For performance, each factory caches the API it creates on the settings object you provide. Subsequent calls to the same factory with the same settings object will return the cached API instantly.

### Example: Creating an API

This is the basic pattern you will use for all `bones` utilities.

```javascript
import * as dodo from '@3sln/dodo';
import observableFactory from '@3sln/bones/observable';
import contextFactory from '@3sln/bones/context';

// Create a single settings object to share
const userSettings = { dodo };

// Create API instances from the factories
const observableApi = observableFactory(userSettings);
const contextApi = contextFactory(userSettings);

// You can even call it again, and it will return the cached instance
const sameObservableApi = observableFactory(userSettings);
console.log(observableApi === sameObservableApi); // true
```
