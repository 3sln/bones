# Bones Agent Guidelines

This document outlines guidelines for LLM agents interacting with the `bones` project.

## 1. Core Architecture

- **Factory-Based:** All modules in `bones` (e.g., `context.js`, `observable.js`) export a factory function as their default export.
- **Dependency Injection:** These factories **must** be instantiated with a `userSettings` object that contains a `dodo` API instance (e.g., `factory({ dodo })`). This ensures that `bones` components use the exact same `dodo` instance as the main application, preventing versioning and state conflicts.
- **Configurability:** The factories use a `settings.js` utility to merge the provided `userSettings` with `bones`-specific defaults. This makes all `bones` components fully configurable and compatible with custom data structures, just like `dodo`.
- **Caching:** To optimize performance, each factory caches its created API instance on the `userSettings` object using a private `Symbol`. Subsequent calls to the factory with the same `userSettings` object will return the cached instance instantly.
- **No Prefabs:** `bones` does not export any pre-configured ("prefab") components. The consumer is responsible for creating all instances via the factories.

## 2. Key Components & Patterns

- **`special` Components:** Most `bones` utilities (`watch`, `useContext`, `shadow`, `memo`, `animate.presence`) are implemented as `dodo` `special` components. This is because they require direct DOM access, lifecycle management, or internal state.
- **State on DOM Nodes:** Stateful components like `watch` and `useContext` attach their internal state directly to the DOM element they manage, using a private `Symbol` as the key to prevent collisions.
- **Observables:** The library includes a powerful set of reactive utilities (`ObservableSubject`, `fromPromise`, `zip`, `throttle`) that form the foundation for state management and asynchronous operations.
- **`mapGetter` Utility:** A highly-optimized utility for creating reusable functions that extract properties from map-like objects, respecting the configured `mapGet` function. This is used internally to make components data-structure-agnostic.

## 3. For Contributors

- **Follow the Factory Pattern:** All new modules must follow the established factory and caching pattern.
- **Use `dodo` Settings:** When manipulating data structures provided by the user (props, context data), always use the configured functions from the `dodo.settings` object (`mapGet`, `mapMerge`, `isSeq`, etc.).
- **Use Private Symbols for State:** When a component needs to attach state to a DOM node, always use a new, private `Symbol` for the key.