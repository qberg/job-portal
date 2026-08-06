// Generate a brand color ramp (50..950) from the Figma-anchored brand-500.
// Method: hold hue constant, monotonic lightness ramp, chroma bell peaking at
// 500. 500 is emitted verbatim (the only Figma-true value); all other stops
// are generated and need visual sign-off. Each stop is checked against the
// sRGB gamut so no value silently clips.

const ANCHOR = { c: 0.181_862, h: 29.2339, l: 0.443_184 }; // brand-500, from Figma

// Per-stop targets. L decreases monotonically; C forms a bell peaking at 500.
// 500 row is overwritten with the exact anchor on output.
const STOPS = [
  { c: 0.022, k: 50, l: 0.971 },
  { c: 0.045, k: 100, l: 0.936 },
  { c: 0.082, k: 200, l: 0.87 },
  { c: 0.12, k: 300, l: 0.76 },
  { c: 0.158, k: 400, l: 0.6 },
  { c: ANCHOR.c, k: 500, l: ANCHOR.l },
  { c: 0.172, k: 600, l: 0.395 },
  { c: 0.15, k: 700, l: 0.35 },
  { c: 0.126, k: 800, l: 0.305 },
  { c: 0.102, k: 900, l: 0.255 },
  { c: 0.07, k: 950, l: 0.165 },
];

// OKLCH -> linear sRGB (Björn Ottosson). Returns [r,g,b] in linear light.
function oklchToLinearSrgb(L, C, hDeg) {
  const h = (hDeg * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l_ = L + 0.396_337_777_4 * a + 0.215_803_757_3 * b;
  const m_ = L - 0.105_561_345_8 * a - 0.063_854_172_8 * b;
  const s_ = L - 0.089_484_177_5 * a - 1.291_485_548 * b;
  const l = l_ ** 3,
    m = m_ ** 3,
    s = s_ ** 3;
  return [
    +4.076_741_662_1 * l - 3.307_711_591_3 * m + 0.230_969_929_2 * s,
    -1.268_438_004_6 * l + 2.609_757_401_1 * m - 0.341_319_396_5 * s,
    -0.004_196_086_3 * l - 0.703_418_614_7 * m + 1.707_614_701 * s,
  ];
}

const inGamut = (L, C, h) =>
  oklchToLinearSrgb(L, C, h).every((v) => v >= -0.001 && v <= 1.001);

// Largest chroma (up to the desired target) that stays inside sRGB at this L/h.
function clampChroma(L, target, h) {
  if (inGamut(L, target, h)) {
    return target;
  }
  let lo = 0,
    hi = target;
  for (let i = 0; i < 24; i += 1) {
    const mid = (lo + hi) / 2;
    if (inGamut(L, mid, h)) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return lo;
}

process.stdout.write(
  "  /* Brand — generated from Figma brand-500 (hue held @ 29.23) */\n"
);
for (const { k, l, c } of STOPS) {
  const isAnchor = k === 500;
  const H = ANCHOR.h;
  const L = isAnchor ? ANCHOR.l : l;
  const C = isAnchor ? ANCHOR.c : clampChroma(L, c, H);
  const clamped = !isAnchor && C < c - 1e-4;
  const lOut = isAnchor ? "0.443184" : L.toFixed(3);
  const cOut = isAnchor ? "0.181862" : C.toFixed(4);
  const hOut = isAnchor ? "29.2339" : H.toFixed(1);
  const note = clamped ? `  /* chroma clamped from ${c.toFixed(4)} */` : "";
  process.stdout.write(
    `  --color-brand-${k}: oklch(${lOut} ${cOut} ${hOut});${note}\n`
  );
}
