import { srgbToLinear, linearToSrgb } from "./oklab";

export type Rgb = { r: number; g: number; b: number; a: number };
export type P3 = { r: number; g: number; b: number; a: number };

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export function p3ToRgb(p3: P3): Rgb {
    const rLinP3 = srgbToLinear(p3.r);
    const gLinP3 = srgbToLinear(p3.g);
    const bLinP3 = srgbToLinear(p3.b);

    const rLin = 1.2249401761 * rLinP3 - 0.2247460786 * gLinP3;
    const gLin = -0.0420569548 * rLinP3 + 1.0419018569 * gLinP3;
    const bLin = -0.0196378544 * rLinP3 - 0.0786361379 * gLinP3 + 1.0979486377 * bLinP3;

    return {
        r: clamp01(linearToSrgb(rLin)) * 255,
        g: clamp01(linearToSrgb(gLin)) * 255,
        b: clamp01(linearToSrgb(bLin)) * 255,
        a: p3.a
    };
}

export function rgbToP3(rgb: Rgb): P3 {
    const rLin = srgbToLinear(rgb.r / 255);
    const gLin = srgbToLinear(rgb.g / 255);
    const bLin = srgbToLinear(rgb.b / 255);
    const rLinP3 = 0.8224621186 * rLin + 0.1775378814 * gLin;
    const gLinP3 = 0.0331941748 * rLin + 0.9668058252 * gLin;
    const bLinP3 = 0.0170827216 * rLin + 0.0723974418 * gLin + 0.9108000000 * bLin;

    return {
        r: linearToSrgb(rLinP3),
        g: linearToSrgb(gLinP3),
        b: linearToSrgb(bLinP3),
        a: rgb.a
    };
}
