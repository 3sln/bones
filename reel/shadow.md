# Shadow DOM

The `shadow` module provides a declarative way to create Shadow DOM boundaries. This is essential for creating encapsulated components whose styles and internal DOM structure don't leak out or conflict with the rest of the page.

## `shadow(props, builder)`

The `shadow` component is a `special` component that attaches a shadow root to its host element.

-   `props`: An optional properties object. It can contain:
    -   `styleSheets`: An array of `CSSStyleSheet` objects to be adopted by the shadow root. The `css` utility from `@3sln/bones/css` is a convenient way to create these.
    -   `internals`: An object to configure `ElementInternals`. This is for advanced use cases when building custom elements.
-   `builder`: A function that returns the VDOM to be rendered inside the shadow root.

## Demo

This demo shows how styles are encapsulated. The red styles are defined in the main document (the panel), but they do not affect the content inside the `shadow` component because it lives in a separate DOM scope. The `shadow` component has its own green styles applied via an adopted stylesheet.

<reel-demo id="bones-shadow-demo" src="/demos/shadow-demo.js"></reel-demo>
