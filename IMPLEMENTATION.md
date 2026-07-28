# Horizontal Journey implementation pass

Generated files:

- `global.implemented.css`: revised stylesheet. Replace the existing `global.css` after reviewing the diff.
- `journey.implemented.js`: replacement for the current inline `<script>`.

Markup changes still required in the Astro page:

1. Add `tabindex="-1"` to `<main id="main">`.
2. Change the skills data item from `HTML &amp; CSS` to `HTML & CSS`.
3. Replace the inline journey script with `<script src="/journey.implemented.js"></script>` after placing the JS file in the public directory, or import the script using the project bundler.
4. Replace the generic `https://github.com/` destination with the actual profile URL, or remove it.
5. Remove the arrow pill and hover affordance from project cards until real project URLs are available.

The revised implementation includes geometry-based navigation, keyboard focus routing, initial/hash/history routing, active navigation state, full reduced-motion fallback, a short-viewport fallback, consolidated cyclist rules, and a distinctive display/body font pairing.
