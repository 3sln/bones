# Style: scoped & css

The `style` module provides utilities for component styling and encapsulation.

## `scoped(props, ...children)`

The `scoped` component is a `special` component that creates a Shadow DOM boundary for its children. This is essential for creating encapsulated components whose styles and internal DOM structure don't leak out or conflict with the rest of the page.

-   `props`: An optional properties object. It can contain:
    -   `styleSheets`: An array of `CSSStyleSheet` objects to be adopted by the shadow root.
-   `...children`: The VDOM nodes to be rendered inside the shadow root.

## `css`

This is a template literal tag, exported from `style.js`, that makes it easy to create `CSSStyleSheet` objects from a string of CSS.

Using constructable stylesheets with `scoped` is much more efficient than creating `<style>` tags, as the CSS is parsed only once and can be shared by multiple component instances.

## Demo

This demo shows how styles are encapsulated. The red styles are defined in the main document, but they do not affect the content inside the `scoped` component. The `scoped` component has its own green styles applied via an adopted stylesheet created with the `css` utility.

<deck-demo id="bones-scoped-demo" src="/demos/scoped-demo.js"></deck-demo>
