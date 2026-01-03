# Changelog

## 0.2.0
- **New**: Support for HSL color space (`hsl()`, `hsla()`)
- **New**: Support for Display P3 color space (`color(display-p3 ...)` with fallback to sRGB)
- **Breaking**: Strict CSS Color 4 parsing for OKLCH
  - Lightness is strictly parsed (0.0-1.0 or 0%-100%), no heuristic for numbers > 1
  - Alpha must be separated by a slash `/` in modern syntax (e.g. `oklch(L C H / A)`)
- Added `toHsl()` and `toP3()` methods to `Color` interface
- Improved P3 to sRGB conversion using correct transfer functions

## 0.1.0
- Add OKLCH parsing (`oklch(...)`) with alpha support
- Add bidirectional conversion between sRGB and OKLCH
- Support RGB → OKLCH and OKLCH → RGB/Hex workflows
- Preserve alpha across all conversions
- `toCss()` emits normalized `oklch(...)` when input is OKLCH
- Improved CSS Color Level 4 normalization

## 0.0.1
- First public release under the `@toolsbee` scope
- Hex color parsing (`#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`)
- CSS RGB and RGBA parsing
- Normalized CSS output
- TypeScript-first build setup (tsup with declaration files)
- ESM and CJS outputs

## 0.0.0
- Initial placeholder release (name reservation)
