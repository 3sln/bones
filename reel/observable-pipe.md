# Observable: Piping and Operators

The observable module includes a `pipe` function and several operators that can be used to create powerful, declarative data transformation pipelines. This is similar to how operators work in libraries like RxJS.

## `pipe(observable, ...operators)`

The `pipe` function takes an observable and a series of operators. It applies each operator to the observable in sequence, returning the final transformed observable.

## Operators

### `map(fn)`

Transforms each value emitted by an observable. It takes a function that receives the original value and returns a new value.

### `dedup()`

Prevents an observable from emitting a value if it is the same as the previously emitted value. It uses the `shouldUpdate` function from the `dodo` settings to determine if a value is a duplicate.

## Demo

This demo uses `driver.property()` to create an observable of a number. A `pipe` then transforms this number:

1.  `map` transforms the number into a color (`blue` for even, `red` for odd).
2.  `dedup` ensures that the color observable only emits a new value when the color actually changes (i.e., when the number switches from even to odd or vice-versa).

Try sliding the number back and forth. You'll notice the "Current number" updates continuously, but the colored text only updates when the even/odd status changes.

<reel-demo id="bones-pipe-demo" src="/demos/observable-pipe-demo.js"></reel-demo>
