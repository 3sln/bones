# Visibility

The `visibility` module provides a component for tracking when an element enters or leaves the viewport (or a scrollable ancestor).

## `withVisibility(builder, options?)`

This is a `special` component that uses an `IntersectionObserver` to monitor when its host element becomes visible.

-   `builder`: A function that receives an `observable` of the visibility state. The observable emits `true` when the element is intersecting and `false` when it is not.
-   `options` (optional): An object that can contain:
    -   `root`: A CSS selector string for a scrollable ancestor element. The observer will track intersections with this element instead of the main viewport. The component finds this element using `element.closest(selector)`.
    -   `display`: The CSS `display` property to apply to the host element (e.g., `'block'`, `'flex'`). Defaults to `'block'`.

## Demo

This demo creates a long, scrollable list of items. Each item uses `withVisibility` to watch its own visibility status relative to the scrollable container (which is specified via the `root` option). When an item scrolls into view, the `isVisible$` observable emits `true`, and the item's background color changes.

<reel-demo id="bones-visibility-demo" src="/demos/visibility-demo.js"></reel-demo>
