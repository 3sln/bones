# Observable: zip

The `zip` utility combines multiple observables into a single observable. It takes a function and a list of observables as input. The function will be called with the latest values from all observables whenever any of them emits a new value.

## Signature

```javascript
zip(fn, ...observables)
```

-   `fn`: A function that receives the latest values from the observables in the order they were passed to `zip`.
-   `...observables`: The observables to combine.

## Demo

This demo uses `driver.property()` to create two observables for a first and last name. These are controlled by the "Properties" panel in the `reel` UI. The `zip` function combines them into a `fullName$` observable, which is then rendered by `watch`.

<reel-demo id="bones-zip-demo" src="/demos/observable-zip-demo.js"></reel-demo>
