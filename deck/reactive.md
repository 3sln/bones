# Reactive Programming

The `reactive` module provides a powerful set of tools for reactive programming, based on the observable pattern. It is the foundation for handling state, events, and asynchronous operations in `@bones`.

## Observable

A base class that represents a stream of values over time. You can `subscribe` to an observable to receive notifications for `next`, `error`, and `complete` events.

### Static Methods

-   `Observable.fromPromise(promise)`: Creates an observable that emits the resolved value of a promise.
-   `Observable.fromAsync(asyncFn)`: Creates an observable that executes an async function and emits its return value.

## ObservableSubject

A special type of observable that allows values to be multicasted to many observers. While a plain `Observable` is unicast (each subscribed observer owns an independent execution), a `Subject` shares its execution among all subscribers.

You can call `.next(value)` on a subject to broadcast a value to all subscribers.

### Static Methods

-   `ObservableSubject.fromGlobalKey(key, initialValue?)`: Creates and returns a shared, global `ObservableSubject` instance based on a unique key. This is the foundation of the `bus` system, allowing disconnected components to communicate.

<deck-demo id="bones-bus-demo" src="/demos/reactive-bus-demo.js"></deck-demo>

## watch

The `watch` component subscribes to an observable and re-renders a builder function whenever the observable emits a new value.

<deck-demo id="bones-watch-demo" src="/demos/reactive-watch-demo.js"></deck-demo>

## Operators and Pipe

You can transform observables by using operators with the `pipe` function. 

-   `pipe(source$, op1, op2, ...)`: Chains operators together.
-   `map(fn)`: Transforms each value.
-   `dedup()`: Prevents duplicate consecutive values from being emitted.
-   `zip(fn, ...observables)`: Combines multiple observables into one.

<deck-demo id="bones-pipe-demo" src="/demos/reactive-pipe-demo.js"></deck-demo>
<deck-demo id="bones-zip-demo" src="/demos/reactive-zip-demo.js"></deck-demo>
