# Memoization

The `memo` module provides a `special` component for memoizing the result of a component function. This is a performance optimization that prevents a component from re-rendering if its inputs haven't changed.

## `memo(dependencies, builder)`

-   `dependencies`: An array of values that the `builder` function depends on. `memo` will only re-run the builder if one of these dependencies has changed since the last render. It uses the `shouldUpdate` function from the `dodo` settings for comparison.
-   `builder`: A function that receives the dependencies as arguments and returns a `dodo` VDOM node.

## Demo

This demo features an "expensive" component that simulates a slow render. This component is wrapped in `memo`.

There are two properties you can change:

1.  **Relevant Prop**: This value is passed into the `memo` component's dependency array. When you change it, the expensive component will re-render.
2.  **Irrelevant Prop**: This value is used by the parent component but is **not** in the `memo` dependency array. When you change it, the parent re-renders, but the expensive component does not, because its dependencies haven't changed. Notice that its render count stays the same.

<reel-demo id="bones-memo-demo" src="/demos/memo-demo.js"></reel-demo>
