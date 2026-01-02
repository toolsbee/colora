# Changelog

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
