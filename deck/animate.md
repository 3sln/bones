# Animate

The `animate` module provides components for handling animations, particularly for elements entering and leaving the DOM.

## `presence(config, builder)`

The `presence` component is a `special` component that animates its children when they are added or removed.

-   `config`: An object that configures the animations.
    -   `spawn`: An animation config for when the element is added.
    -   `despawn`: An animation config for when the element is removed.
    -   `mode`: Can be `'remove'` (the element is removed from the DOM after despawning) or `'hide'` (the element gets `display: none` after despawning).
-   `builder`: A function that returns a VDOM node to render. If the builder returns `null` or `undefined`, the `despawn` animation is triggered. The builder receives the current animation state (`spawning`, `spawned`, `despawning`, `despawned`) as an argument.

### Animation Config

An animation config object can contain:
-   `animation`: An object with `keyframes` and `options` for the Web Animations API (`element.animate()`).
-   `classes`: An array of CSS classes to apply for the animation.
-   `styling`: An object of CSS styles to apply for the animation.
-   `fn`: A custom function that receives the element and returns a `Promise` that resolves when the animation is complete.
-   `duration`: A fallback duration if using a simple string for the `animation` property.

## Demo

This demo toggles the presence of a `div`. The `presence` component is configured to use the Web Animations API to apply a fade-in (`spawn`) and fade-out (`despawn`) animation.

<deck-demo id="bones-animate-demo" src="/demos/animate-demo.js"></deck-demo>
