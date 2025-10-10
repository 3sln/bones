# Bus

The `bus` module provides tools for creating simple, global, key-based event buses. This is useful for state management or cross-component communication where a direct parent-child or context relationship is not practical.

## `ObservableSubject`

This is a simple class that is both an observable and an observer. You can subscribe to it, and you can call `.next(value)` on it to broadcast a value to all subscribers.

## `fromGlobalKey(key, initialValue?)`

This function creates and returns a shared `ObservableSubject` instance based on a unique key (typically a `Symbol`). If a subject for the key doesn't exist, it's created with the optional `initialValue`. If it already exists, the existing subject is returned. This allows different parts of your application to get a reference to the exact same observable subject without having to pass it around.

## `publish(bus, value)`

This is a `special` component that declaratively publishes a value to a bus. Whenever the `value` changes, it calls `.next(value)` on the `bus` subject.

## Demo

This demo shows two components, a Publisher and a Subscriber. They are siblings in the DOM tree, but they can communicate using a bus created with `fromGlobalKey`. The Publisher component has an input field and a button to send a new message to the bus. The Subscriber component uses `watch` to listen for messages on the bus and display them.

<reel-demo id="bones-bus-demo" src="/demos/bus-demo.js"></reel-demo>
