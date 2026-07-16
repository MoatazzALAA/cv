// utils/parseCubicBezier.ts
//
// design_config.json stores easing as a CSS cubic-bezier(...) string (so it's
// also directly usable in plain CSS elsewhere). Framer Motion's `ease` prop,
// however, expects a numeric [x1, y1, x2, y2] tuple, not a CSS string. This
// utility bridges that gap so the *value itself* only ever lives in one place
// (design_config.json) — components never hardcode a duplicate easing curve.

const DEFAULT_BEZIER: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function parseCubicBezier(css: string): [number, number, number, number] {
  const match = css.match(
    /cubic-bezier\(\s*([\d.-]+)\s*,\s*([\d.-]+)\s*,\s*([\d.-]+)\s*,\s*([\d.-]+)\s*\)/
  );

  if (!match) {
    // Malformed or unexpected format — fail safe with the locked default
    // rather than letting a transition silently break.
    return DEFAULT_BEZIER;
  }

  const [x1, y1, x2, y2] = match.slice(1, 5).map(Number);
  return [x1, y1, x2, y2];
}
