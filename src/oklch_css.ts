import type { Oklch } from "./oklab";

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

function trimFloat(n: number): string {
  const s = n.toFixed(4);
  return s.replace(/\.?0+$/, "");
}

function parseAlpha(raw: string | undefined): number | null {
  if (raw == null) return null;
  const t = raw.trim();
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

function parseL(raw: string): number | null {
  const t = raw.trim();
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

function parseC(raw: string): number | null {
  const n = Number(raw.trim());
  return Number.isFinite(n) ? Math.max(0, n) : null;
}

function parseHue(raw: string): number | null {
  const t = raw.trim().toLowerCase();
  if (!t) return null;

  const match = /^([+-]?\d*\.?\d+)(deg|rad|grad|turn)?$/.exec(t);
  if (!match) return null;

  const numStr = match[1];
  const unit = match[2] ?? "deg";

  const v = Number(numStr);
  if (!Number.isFinite(v)) return null;

  let deg = v;
  if (unit === "rad") deg = v * (180 / Math.PI);
  else if (unit === "grad") deg = v * 0.9;
  else if (unit === "turn") deg = v * 360;

  deg = ((deg % 360) + 360) % 360;
  return deg;
}

export function parseOklchCss(input: string): Oklch | null {
  const match = /^oklch\(([\s\S]*)\)$/i.exec(input.trim());
  if (!match) return null;

  const bodyRaw = match[1];
  if (bodyRaw == null) return null;

  const body = bodyRaw.trim();
  if (!body) return null;

  const parts = body.split("/", 2);
  const left = parts[0]?.trim() ?? "";
  const alphaPart = parts[1]?.trim();

  const toks = left.split(/\s+/).filter(Boolean);
  if (toks.length !== 3) return null;

  const lTok = toks[0];
  const cTok = toks[1];
  const hTok = toks[2];
  const aTok = toks[3];

  if (!lTok || !cTok || !hTok) return null;

  const l = parseL(lTok);
  const c = parseC(cTok);
  const h = parseHue(hTok);

  if (l == null || c == null || h == null) return null;

  let a = 1;
  if (alphaPart) {
    const av = parseAlpha(alphaPart);
    if (av == null) return null;
    a = av;
  }

  return { l, c, h, a };
}

export function formatOklchCss(lch: Oklch): string {
  const L = `${trimFloat(lch.l * 100)}%`;
  const C = trimFloat(lch.c);
  const H = trimFloat(lch.h);

  const a = clamp01(lch.a);
  if (a >= 1) return `oklch(${L} ${C} ${H})`;
  return `oklch(${L} ${C} ${H} / ${trimFloat(a)})`;
}
