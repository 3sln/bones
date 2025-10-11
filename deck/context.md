# Context

The context module provides a robust, DOM-scoped context system, similar to React's Context API. It allows you to pass data through the component tree without having to pass props down manually at every level.

It's implemented using `dodo`'s `special` components.

## `withContext(data, ...children)`

This component creates a context provider. It takes a data object and makes it available to all of its descendants.

## `useContext(keys, builder)`

This component consumes data from a context provider. It subscribes to the context and re-renders its `builder` function whenever the context data changes.

-   `keys`: An array of strings specifying which keys to extract from the context data.
-   `builder`: A function that receives an object containing the requested data and returns a `dodo` VDOM node.

## Encapsulation

The context system respects Shadow DOM boundaries by default. `useContext` will not see data from a `withContext` provider if there is a Shadow DOM boundary between them.

-   `withEncapsulatedContext`: Provides context that does **not** cross Shadow DOM boundaries.
-   `withContext`: Provides context that **does** cross Shadow DOM boundaries.

## Demo

In this demo, `withContext` provides a `color` value. A child component then uses `useContext` to subscribe to that value and render text with the specified color. The color is supplied by a `driver.property`, so you can change it from the "Properties" panel.

<deck-demo id="bones-context-demo" src="/demos/context-demo.js"></deck-demo>
