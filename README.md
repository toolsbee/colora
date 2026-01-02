# Colora

Tiny modern CSS color parser & converter (OKLCH-first).

> Early development. API not stable yet.

Maintained by **toolsbee.com** · https://www.toolsbee.com

---

## Install

```bash
npm install @toolsbee/colora
```

## Basic Usage

```js
import { parseColor } from "@toolsbee/colora";

// Hex
parseColor("#0ea5e9").toRgb();
// → { r: 14, g: 165, b: 233, a: 1 }

// RGB (CSS Color Level 4 syntax)
parseColor("rgb(10 20 30 / 0.5)").toHex();
// → "#0A141E80"

// RGB (comma syntax)
parseColor("rgba(255, 0, 0, 0.25)").toCss();
// → "rgb(255 0 0 / 0.25)"
```

## CSS Normalization

```js
parseColor("rgb(10,20,30)").toCss();
// → "rgb(10 20 30)"

parseColor("rgb(10 20 30 / .5000)").toCss();
// → "rgb(10 20 30 / 0.5)"
```

## Error Handling

```js
try {
  parseColor("not-a-color");
} catch (err) {
  console.error(err.message);
}
```

## Supported Formats (v0.x)

- Hex: `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`
- RGB/RGBA:
  - `rgb(1 2 3)`
  - `rgb(1 2 3 / 0.5)`
  - `rgb(1, 2, 3)`
  - `rgba(1, 2, 3, 0.5)`

> OKLCH support is planned for the next minor release.

## Browser Example

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Colora – Basic Example</title>
</head>
<body>
  <h1>Colora demo</h1>
  <pre id="out"></pre>

  <script type="module">
    import { parseColor } from "https://cdn.jsdelivr.net/npm/@toolsbee/colora@0.0.1/dist/index.js";

    const c1 = parseColor("#0ea5e9");
    const c2 = parseColor("rgb(10 20 30 / 0.5)");

    const out = document.getElementById("out");
    out.textContent = JSON.stringify({
      hexToRgb: c1.toRgb(),
      rgbToHex: c2.toHex(),
      normalizedCss: c2.toCss()
    }, null, 2);
  </script>
</body>
</html>
```

## License

MIT
