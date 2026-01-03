export type Rgb = { r: number; g: number; b: number; a: number };
export type Oklab = { l: number; a: number; b: number };
export type Oklch = { l: number; c: number; h: number; a: number };

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export function srgbToLinear(u: number): number {
  return u <= 0.04045 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4);
}

export function linearToSrgb(u: number): number {
  return u <= 0.0031308 ? 12.92 * u : 1.055 * Math.pow(u, 1 / 2.4) - 0.055;
}

export function rgbToOklab(rgb: Rgb): Oklab {
  const r = srgbToLinear(clamp01(rgb.r / 255));
  const g = srgbToLinear(clamp01(rgb.g / 255));
  const b = srgbToLinear(clamp01(rgb.b / 255));

  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  return {
    l: 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_
  };
}

export function oklabToRgb(lab: Oklab, alpha = 1): Rgb {
  const l_ = lab.l + 0.3963377774 * lab.a + 0.2158037573 * lab.b;
  const m_ = lab.l - 0.1055613458 * lab.a - 0.0638541728 * lab.b;
  const s_ = lab.l - 0.0894841775 * lab.a - 1.2914855480 * lab.b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  let rLin = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  let gLin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  let bLin = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

  const r = clamp01(linearToSrgb(rLin));
  const g = clamp01(linearToSrgb(gLin));
  const b = clamp01(linearToSrgb(bLin));

  return { r: r * 255, g: g * 255, b: b * 255, a: clamp01(alpha) };
}

export function oklabToOklch(lab: Oklab, alpha = 1): Oklch {
  const c = Math.hypot(lab.a, lab.b);
  let h = Math.atan2(lab.b, lab.a) * (180 / Math.PI);
  if (h < 0) h += 360;
  if (c < 1e-12) h = 0;

  return { l: lab.l, c, h, a: clamp01(alpha) };
}

export function oklchToOklab(lch: Oklch): Oklab {
  const hr = (lch.h * Math.PI) / 180;
  return {
    l: lch.l,
    a: lch.c * Math.cos(hr),
    b: lch.c * Math.sin(hr)
  };
}
