# Observable: watch

The `watch` component is the most fundamental utility in the observable module. It subscribes to an observable and re-renders a builder function whenever the observable emits a new value.

It's a `special` component, which means it directly manages its DOM lifecycle.

## Signature

```javascript
watch(observable, builder, options?)
```

-   `observable`: The reactive source to subscribe to.
-   `builder`: A function that receives the latest value from the observable and returns a `dodo` VDOM node.
-   `options` (optional): An object that can contain:
    -   `placeholder`: A function that returns a VDOM node to display until the observable emits its first value.
    -   `error`: A function that receives an error from the observable and returns a VDOM node to display.

## Demo

This demo uses an `ObservableSubject` (from the `bus` module) to hold a counter's state. The `watch` component subscribes to the subject and updates the paragraph tag with the latest count. The buttons simply call `.next()` on the subject to emit a new value.

<reel-demo id="bones-watch-demo" src="/demos/observable-watch-demo.js"></reel-demo>
