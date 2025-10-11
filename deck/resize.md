# Resize

The `resize` module provides a component for tracking the size of a container.

## `withContainerSize(builder)`

This is a `special` component that uses a `ResizeObserver` to monitor the dimensions of its host element.

-   `builder`: A function that receives an `observable` of the container's size. The observable emits objects of the form `{ width, height }`.

`withContainerSize` is smart enough to find the correct element to observe. If it is placed on an element with `display: contents`, it will traverse up the DOM tree to find the first parent element that is actually rendered with a size.

## Demo

This demo uses `withContainerSize` to create a size-aware component. The component is placed inside a `div` that has been made resizable with standard CSS. Drag the corner of the box to see the reported size update.

<deck-demo id="bones-resize-demo" src="/demos/resize-demo.js"></deck-demo>
