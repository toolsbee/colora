# Colora

Colora is a tiny, modern CSS color parser and converter with first-class OKLCH support.

It focuses on:
- correctness (CSS Color Level 4 friendly)
- predictable normalization
- perceptual color workflows using OKLCH

> Early development. API may evolve, but breaking changes will follow semantic versioning.

Maintained by **toolsbee.com** · https://www.toolsbee.com

---

## Install

npm install @toolsbee/colora

---

## Quick Start

```js
import { parseColor } from "@toolsbee/colora";

parseColor("#0ea5e9").toRgb();
// { r: 14, g: 165, b: 233, a: 1 }

parseColor("rgb(10 20 30 / 0.5)").toHex();
// "#0A141E80"

parseColor("oklch(62% 0.18 240 / 0.9)").toCss();
// "oklch(62% 0.18 240 / 0.9)"

parseColor("hsl(0 100% 50%)").toRgb();
// { r: 255, g: 0, b: 0, a: 1 }

parseColor("color(display-p3 1 0 0)").toHex();
// "#FF0000" (Clamped to sRGB)
````

---

## Core API

Colora exposes a single entry point and a small set of conversion methods.

### parseColor(input: string)

Parses any supported CSS color format and returns a Color object.

```js
const color = parseColor("rgba(255, 0, 0, 0.25)");
```

### Color methods

| Method    | Description                         | Returns                  |
| --------- | ----------------------------------- | ------------------------ |
| toRgb()   | Convert to sRGB with alpha          | { r, g, b, a }           |
| toHex()   | Convert to hex with alpha if needed | "#RRGGBB" or "#RRGGBBAA" |
| toHsl()   | Convert to HSL                      | { h, s, l, a }           |
| toP3()    | Convert to Display P3               | { r, g, b, a }           |
| toOklch() | Convert to OKLCH (perceptual)       | { l, c, h, a }           |
| toCss()   | Normalized CSS output               | formatted string         |

All conversions are bidirectional and preserve alpha.

---

## RGB and OKLCH Workflows

```js
const base = parseColor("#0ea5e9").toOklch();

const darker = {
  ...base,
  l: base.l - 0.1
};

parseColor(
  `oklch(${darker.l * 100}% ${darker.c} ${darker.h})`
).toHex();
```

---

## CSS Normalization

```js
parseColor("rgb(10,20,30)").toCss();
// "rgb(10 20 30)"

parseColor("rgb(10 20 30 / .5000)").toCss();
// "rgb(10 20 30 / 0.5)"
```

---

## Supported Formats

### Hex

* #rgb
* #rgba
* #rrggbb
* #rrggbbaa

### RGB and RGBA

* rgb(1 2 3)
* rgb(1 2 3 / 0.5)
* rgb(1, 2, 3)
* rgba(1, 2, 3, 0.5)

### HSL and HSLA

* hsl(0 100% 50%)
* hsl(0, 100%, 50%)
* hsla(0, 100%, 50%, 0.5)

### Display P3

* color(display-p3 1 0 0)
* color(display-p3 1 0 0 / 0.5)

### OKLCH

* oklch(62% 0.18 240)
* oklch(0.62 0.18 240)
* oklch(62% 0.18 240 / 0.9)
* Hue units supported: deg, rad, grad, turn

> **Note**: Parsing is strictly spec-compliant. Percentages must use `%`. Alpha in modern syntax must use `/`.

---

## Browser Usage

```html
<!doctype html>
<html>
  <body>
    <pre id="out">Loading…</pre>

    <script type="module">
      import { parseColor } from "https://cdn.jsdelivr.net/npm/@toolsbee/colora@0.2.0/dist/index.js";

      const cHex  = parseColor("#0ea5e9");
      const cRgb  = parseColor("rgb(10 20 30 / 0.5)");
      const cHsl  = parseColor("hsl(0 100% 50%)");
      const cP3   = parseColor("color(display-p3 0 1 0)");
      const cOkl  = parseColor("oklch(62% 0.18 240 / 0.9)");

      document.getElementById("out").textContent = JSON.stringify(
        {
          // Hex input
          hex_to_rgb: cHex.toRgb(),
          hex_to_hsl: cHex.toHsl(),
          hex_to_p3:  cHex.toP3(),
          hex_to_oklch: cHex.toOklch(),

          // RGB normalization
          rgb_to_css: cRgb.toCss(),
          rgb_to_hex: cRgb.toHex(),

          // HSL Input
          hsl_to_rgb: cHsl.toRgb(),
          hsl_to_css: cHsl.toCss(),

          // P3 Input (Wide Gamut)
          p3_to_rgb: cP3.toRgb(),
          p3_raw:    cP3.toP3(),

          // OKLCH conversions
          oklch_to_css: cOkl.toCss(),
          oklch_to_hex: cOkl.toHex(),
          oklch_to_rgb: cOkl.toRgb(),
          oklch_roundtrip: cOkl.toOklch()
        },
        null,
        2
      );
    </script>
  </body>
</html>
```

When using ES modules locally, run a local server. ES modules do not work reliably via file URLs.

---

## Error Handling

```js
try {
  parseColor("not-a-color");
} catch (err) {
  console.error(err.message);
}
```

---

## Design Goals

* Small, dependency-free core
* Modern CSS Color Level 4 syntax
* Perceptual correctness via OKLCH
* ESM and CJS support
* CDN-friendly builds

---

## License

MIT
 
