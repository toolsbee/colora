export type Rgb = { r: number; g: number; b: number; a: number };
export type Oklch = { l: number; c: number; h: number; a: number };

export type Color = {
  toRgb(): Rgb;
  toHex(): string;
  toOklch(): Oklch;
  toCss(): string;
};

class ParsedColor implements Color {
  constructor(private readonly rgb: Rgb, private readonly oklch?: Oklch) {}

  toRgb(): Rgb {
    return { ...this.rgb };
  }

  toHex(): string {
    const { r, g, b, a } = this.rgb;

    const clamp255 = (n: number) => Math.max(0, Math.min(255, n));
    const to2 = (n: number) =>
      Math.round(n).toString(16).padStart(2, "0").toUpperCase();

    const rr = to2(clamp255(r));
    const gg = to2(clamp255(g));
    const bb = to2(clamp255(b));

    if (a >= 1) return `#${rr}${gg}${bb}`;
    const aa = to2(clamp255(a * 255));
    return `#${rr}${gg}${bb}${aa}`;
  }

  toOklch(): Oklch {
    if (!this.oklch) throw new Error("OKLCH conversion not implemented yet.");
    return { ...this.oklch };
  }

  toCss(): string {
    // v0: normalize to rgb() for now (css4 form)
    const { r, g, b, a } = this.rgb;
    const rr = Math.round(r);
    const gg = Math.round(g);
    const bb = Math.round(b);
    const aa = clamp01(a);

    return aa >= 1
      ? `rgb(${rr} ${gg} ${bb})`
      : `rgb(${rr} ${gg} ${bb} / ${trimFloat(aa)})`;
  }
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function trimFloat(n: number): string {
  const s = n.toFixed(4);
  return s.replace(/\.?0+$/, "");
}

// v0: parse only hex + rgb() first, then we add oklch()
export function parseColor(input: string): Color {
  const s = input.trim();

  const hex = parseHex(s);
  if (hex) return new ParsedColor(hex);

  const rgb = parseRgbCss(s);
  if (rgb) return new ParsedColor(rgb);

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
  // supports:
  // rgb(1 2 3) / rgb(1 2 3 / .5) / rgb(1, 2, 3) / rgba(1,2,3,0.5)
  const fn = /^(rgba?)\((.*)\)$/i.exec(s);
  if (!fn) return null;

  const body = (fn[2] ?? "").trim();
  if (!body) return null;

  // split by / for alpha (css4)
  const parts = body.split("/");
  const left = (parts[0] ?? "").trim();
  const alphaPart = parts.length > 1 ? (parts[1] ?? "").trim() : undefined;

  // comma or space separated
  const nums = left.includes(",")
    ? left.split(",").map((x) => x.trim()).filter(Boolean)
    : left.split(/\s+/).map((x) => x.trim()).filter(Boolean);

  const n0 = nums[0];
  const n1 = nums[1];
  const n2 = nums[2];

  if (n0 === undefined || n1 === undefined || n2 === undefined) return null;

  const r = parseCssNumber255(n0);
  const g = parseCssNumber255(n1);
  const b = parseCssNumber255(n2);
  if (r == null || g == null || b == null) return null;

  let a = 1;

  if (alphaPart && alphaPart.length > 0) {
    const av = parseCssAlpha(alphaPart);
    if (av == null) return null;
    a = av;
  } else {
    const n3 = nums[3];
    if (n3 !== undefined) {
      const av = parseCssAlpha(n3);
      if (av == null) return null;
      a = av;
    }
  }

  return { r, g, b, a };
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
