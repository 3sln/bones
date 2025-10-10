# CSS Utility

The `css` module exports a single template literal tag that makes it easy to create `CSSStyleSheet` objects.

## `css`

This function takes a template literal string of CSS and returns a `CSSStyleSheet` instance. These stylesheets can then be adopted by a Shadow DOM, most commonly using the `shadow` component.

Using constructable stylesheets is much more efficient than creating `<style>` tags, as the CSS is parsed only once and can be shared by multiple components.

## Demo

This demo creates a stylesheet using the `css` utility and passes it to a `shadow` component. The content inside the Shadow DOM is then styled by the adopted stylesheet.

<reel-demo id="bones-css-demo" src="/demos/css-demo.js"></reel-demo>
