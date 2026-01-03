import { rgbToOklab, oklabToOklch, oklchToOklab, oklabToRgb } from "./oklab";
import { parseOklchCss, formatOklchCss } from "./oklch_css";
import { type Hsl, rgbToHsl, hslToRgb } from "./hsl";
import { type P3, rgbToP3, p3ToRgb } from "./p3";

export type Rgb = { r: number; g: number; b: number; a: number };
export type Oklch = { l: number; c: number; h: number; a: number };
export type { Hsl, P3 };

export type Color = {
  toRgb(): Rgb;
  toHex(): string;
  toOklch(): Oklch;
  toHsl(): Hsl;
  toP3(): P3;
  toCss(): string;
};

class ParsedColor implements Color {
  constructor(
    private rgb?: Rgb,
    private oklch?: Oklch,
    private hsl?: Hsl,
    private p3?: P3,
    private prefer: "rgb" | "oklch" | "hsl" | "p3" = "rgb"
  ) { }

  toRgb(): Rgb {
    if (this.rgb) return { ...this.rgb };

    if (this.oklch) {
      const lab = oklchToOklab(this.oklch);
      const rgb = oklabToRgb(lab, this.oklch.a);
      this.rgb = rgb;
      return { ...rgb };
    }

    if (this.hsl) {
      const rgb = hslToRgb(this.hsl);
      this.rgb = rgb;
      return { ...rgb };
    }

    if (this.p3) {
      const rgb = p3ToRgb(this.p3);
      this.rgb = rgb;
      return { ...rgb };
    }

    throw new Error("Color has no RGB representation.");
  }

  toHex(): string {
    const { r, g, b, a } = this.toRgb();
    const to2 = (n: number) => Math.round(n).toString(16).padStart(2, "0").toUpperCase();
    const clamp255 = (n: number) => Math.max(0, Math.min(255, n));

    const rr = to2(clamp255(r));
    const gg = to2(clamp255(g));
    const bb = to2(clamp255(b));

    if (a >= 1) return `#${rr}${gg}${bb}`;
    const aa = to2(clamp255(a * 255));
    return `#${rr}${gg}${bb}${aa}`;
  }

  toOklch(): Oklch {
    if (this.oklch) return { ...this.oklch };

    const rgb = this.toRgb();
    const lab = rgbToOklab(rgb);
    const lch = oklabToOklch(lab, rgb.a);
    this.oklch = lch;
    return { ...lch };
  }

  toHsl(): Hsl {
    if (this.hsl) return { ...this.hsl };
    const rgb = this.toRgb();
    const hsl = rgbToHsl(rgb);
    this.hsl = hsl;
    return { ...hsl };
  }

  toP3(): P3 {
    if (this.p3) return { ...this.p3 };
    const rgb = this.toRgb();
    const p3 = rgbToP3(rgb);
    this.p3 = p3;
    return { ...p3 };
  }

  toCss(): string {
    if (this.prefer === "oklch") {
      return formatOklchCss(this.toOklch());
    }

    if (this.prefer === "p3") {
      const p3 = this.toP3();
      const r = trimFloat(p3.r);
      const g = trimFloat(p3.g);
      const b = trimFloat(p3.b);
      const a = p3.a;
      return a >= 1 ? `color(display-p3 ${r} ${g} ${b})` : `color(display-p3 ${r} ${g} ${b} / ${trimFloat(a)})`;
    }

    if (this.prefer === "hsl") {
      const hsl = this.toHsl();
      const h = trimFloat(hsl.h);
      const s = trimFloat(hsl.s);
      const l = trimFloat(hsl.l);
      const a = hsl.a;
      return a >= 1 ? `hsl(${h} ${s}% ${l}%)` : `hsl(${h} ${s}% ${l}% / ${trimFloat(a)})`;
    }

    const { r, g, b, a } = this.toRgb();
    const rr = Math.round(r);
    const gg = Math.round(g);
    const bb = Math.round(b);
    const aa = Math.max(0, Math.min(1, a));
    return aa >= 1 ? `rgb(${rr} ${gg} ${bb})` : `rgb(${rr} ${gg} ${bb} / ${trimFloat(aa)})`;
  }
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function trimFloat(n: number): string {
  const s = n.toFixed(4);
  return s.replace(/\.?0+$/, "");
}

export function parseColor(input: string): Color {
  const s = input.trim();

  // oklch()
  const lch = parseOklchCss(s);
  if (lch) return new ParsedColor(undefined, lch, undefined, undefined, "oklch");

  // hex
  const hex = parseHex(s);
  if (hex) return new ParsedColor(hex, undefined, undefined, undefined, "rgb");

  // rgb()/rgba()
  const rgb = parseRgbCss(s);
  if (rgb) return new ParsedColor(rgb, undefined, undefined, undefined, "rgb");

  // hsl()/hsla()
  const hsl = parseHslCss(s);
  if (hsl) return new ParsedColor(undefined, undefined, hsl, undefined, "hsl");

  // color(display-p3 ...)
  const p3 = parseP3Css(s);
  if (p3) return new ParsedColor(undefined, undefined, undefined, p3, "p3");

  throw new Error(`Unsupported color format: ${input}`);
}

function parseHex(s: string): Rgb | null {
  const m = s.match(/^#(?<hex>[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/);
  const h = m?.groups?.hex;
  if (!h) return null;

  const expand = (ch: string) => ch + ch;

  let r = 0,
    g = 0,
    b = 0,
    a = 255;

  if (h.length === 3 || h.length === 4) {
    const c0 = h.charAt(0);
    const c1 = h.charAt(1);
    const c2 = h.charAt(2);
    const c3 = h.length === 4 ? h.charAt(3) : "";

    r = parseInt(expand(c0), 16);
    g = parseInt(expand(c1), 16);
    b = parseInt(expand(c2), 16);
    if (h.length === 4) a = parseInt(expand(c3), 16);
  } else {
    r = parseInt(h.slice(0, 2), 16);
    g = parseInt(h.slice(2, 4), 16);
    b = parseInt(h.slice(4, 6), 16);
    if (h.length === 8) a = parseInt(h.slice(6, 8), 16);
  }

  return { r, g, b, a: a / 255 };
}

function parseRgbCss(s: string): Rgb | null {
  const fn = /^(rgba?)\((.*)\)$/i.exec(s);
  if (!fn) return null;

  const body = (fn[2] ?? "").trim();
  if (!body) return null;

  const parts = splitParams(body);
  if (parts.length < 3) return null;

  if (!parts[0] || !parts[1] || !parts[2]) return null;

  const r = parseCssNumber255(parts[0]);
  const g = parseCssNumber255(parts[1]);
  const b = parseCssNumber255(parts[2]);
  if (r == null || g == null || b == null) return null;

  let a = 1;
  if (parts[3] !== undefined) {
    const av = parseCssAlpha(parts[3]);
    if (av == null) return null;
    a = av;
  }

  return { r, g, b, a };
}

function parseHslCss(s: string): Hsl | null {
  const fn = /^(hsla?)\((.*)\)$/i.exec(s);
  if (!fn) return null;

  const body = (fn[2] ?? "").trim();
  if (!body) return null;

  const parts = splitParams(body);
  if (parts.length < 3) return null;

  if (!parts[0] || !parts[1] || !parts[2]) return null;

  const h = parseHue(parts[0]);
  const sPct = parsePercentage(parts[1]); // HSL saturation is strictly percentage-ish
  const lPct = parsePercentage(parts[2]);

  if (h == null || sPct == null || lPct == null) return null;

  let a = 1;
  if (parts[3] !== undefined) {
    const av = parseCssAlpha(parts[3]);
    if (av == null) return null;
    a = av;
  }

  return { h, s: sPct, l: lPct, a };
}

function parseP3Css(s: string): P3 | null {
  const fn = /^color\((.*)\)$/i.exec(s);
  if (!fn) return null;

  const body = (fn[1] ?? "").trim();
  if (!body) return null;

  const parts = body.split("/");
  const left = parts[0]?.trim() ?? "";
  const alphaPart = parts[1]?.trim();

  const toks = left.split(/\s+/).filter(Boolean);
  if (toks[0] !== "display-p3") return null;

  const rTok = toks[1];
  const gTok = toks[2];
  const bTok = toks[3];
  if (!rTok || !gTok || !bTok) return null;

  const r = Number(rTok);
  const g = Number(gTok);
  const b = Number(bTok);
  if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b)) return null;

  let a = 1;
  if (alphaPart) {
    const av = parseCssAlpha(alphaPart);
    if (av == null) return null;
    a = av;
  } else if (toks[4]) {
    const av = parseCssAlpha(toks[4]);
    if (av != null) a = av;
  }

  return { r, g, b, a };
}

function splitParams(body: string): string[] {
  if (body.includes("/")) {
    const [left, right] = body.split("/", 2);
    const params = splitSep(left ?? "");
    if (right) params.push(right.trim());
    return params;
  }
  return splitSep(body);
}

function splitSep(s: string): string[] {
  if (s.includes(",")) {
    return s.split(",").map((x) => x.trim()).filter(Boolean);
  }
  return s.split(/\s+/).map((x) => x.trim()).filter(Boolean);
}

function parseCssNumber255(s: string): number | null {
  const t = s.trim();
  if (!t) return null;
  if (t.endsWith("%")) {
    const p = Number(t.slice(0, -1));
    if (!Number.isFinite(p)) return null;
    return (p / 100) * 255;
  }
  const n = Number(t);
  if (!Number.isFinite(n)) return null;
  return n;
}

function parseCssAlpha(s: string): number | null {
  const t = s.trim();
  if (!t) return null;
  if (t.endsWith("%")) {
    const p = Number(t.slice(0, -1));
    if (!Number.isFinite(p)) return null;
    return clamp01(p / 100);
  }
  const n = Number(t);
  if (!Number.isFinite(n)) return null;
  return clamp01(n);
}

function parsePercentage(s: string): number | null {
  const t = s.trim();
  if (t.endsWith("%")) {
    return Number(t.slice(0, -1));
  }
  const n = Number(t);
  if (Number.isFinite(n)) return n;
  return null;
}

function parseHue(s: string): number | null {
  const t = s.trim().toLowerCase();
  const m = /^([+-]?\d*\.?\d+)(deg|rad|grad|turn)?$/.exec(t);
  if (!m) return null;
  const val = Number(m[1]);
  const unit = m[2] || "deg";
  if (!Number.isFinite(val)) return null;

  let deg = val;
  if (unit === "rad") deg = val * (180 / Math.PI);
  else if (unit === "grad") deg = val * 0.9;
  else if (unit === "turn") deg = val * 360;

  return ((deg % 360) + 360) % 360;
}
