// The home page sky: ASCII clouds and a humpback whale, drawn on a canvas made of text cells (src/pages/index.astro).
// No library. Everything is a grid of monospace characters that steps at 10 frames a second, one whole cell at a
// time, so it moves like an 8-bit game. Colours come from --sky-ink / --sky-ink-hot in src/styles.css.

const TICK_MS = 100; // 10 frames a second
const LEVELS = 16; // brightness steps used for colours
const RAMP = " .:-=+*xXS$%#@"; // dark to bright characters used to shade the whale
const CLOUD = " .:oO@#"; // cloud puffs: soft edges to dense cores
const MOVE_TICKS = 300; // one crossing takes 30 seconds
const CYCLE_TICKS = 340; // then a 4 second gap before the next pass
const FADE = 0.18; // whale brightness left under the card and tree
const CLOUD_FADE = 0.4; // same, for clouds
const RIM_PX = 56; // band inside the card and tree that the glass lens bends (it samples up to about 47px in)
const RIM_KEEP = 0.5; // sky brightness in that band: enough to see it bend, soft enough not to streak

// ---- small helpers ----
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

// Value noise: the same numbers every time, so the clouds are always the same shape.
function hash(x: number, y: number, s: number) {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(s, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function noise(x: number, y: number, s: number) {
  const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x: number, y: number, s: number) {
  let t = 0, amp = 0.5, f = 1, n = 0;
  for (let o = 0; o < 4; o++) { t += amp * noise(x * f, y * f, s + o); n += amp; amp *= 0.5; f *= 2; }
  return t / n;
}

// ---- the whale shape (side view, head at u=0, tail at u=1, y in units of H = a tenth of its length, down is positive) ----
function dorsal(u: number) {
  let d: number;
  if (u < 0.08) d = 0.65 * Math.sqrt(u / 0.08); // rounded snout
  else if (u < 0.22) d = lerp(0.65, 0.8, smooth(0.08, 0.22, u)); // long, flat top of the head
  else if (u < 0.4) d = lerp(0.8, 1.1, smooth(0.22, 0.4, u));
  else if (u < 0.86) d = lerp(1.1, 0.16, smooth(0.4, 0.86, u));
  else d = 0.16;
  return d + 0.22 * Math.exp(-(((u - 0.64) / 0.025) ** 2)); // the small dorsal hump
}
function ventral(u: number) { // the lower jaw and throat sit much deeper than the top of the head
  if (u < 0.07) return 0.95 * Math.sqrt(u / 0.07);
  if (u < 0.3) return lerp(0.95, 1.55, smooth(0.07, 0.3, u));
  if (u < 0.86) return lerp(1.55, 0.16, smooth(0.3, 0.86, u));
  return 0.16;
}

// What one whale-local point looks like. Sets sc (character), sb (brightness 0..1), sk (priority) and returns false if empty.
let sc = 0, sb = 0, sk = 0;
let minRow = 0.17, minDot = 0.01; // grooves and details are never thinner than one cell
function body(u: number, y: number) {
  let half = 0;
  if (u > 0.84) { // wide forked flukes, with a notch in the middle
    const t = (u - 0.84) / 0.16;
    half = 0.16 + 1.15 * t * t;
    if (Math.abs(y) > half || (u > 0.97 && Math.abs(y) < 0.25)) return false;
    sb = lerp(5, 12, (1 - (Math.abs(y) / half) * 0.6) * (1 - t * 0.4)) / 13;
    sc = RAMP.charCodeAt(Math.round(sb * 13)); sk = 0;
    return true;
  }
  const top = -dorsal(u), bot = ventral(u);
  if (y < top || y > bot) return false;
  const c = (top + bot) / 2, r = (bot - top) / 2, ny = (y - c) / r, nz = Math.sqrt(Math.max(0, 1 - ny * ny));
  const light = Math.max(0, -0.55 * ny + 0.75 * nz) + 0.15 + 0.06 * (1 - u); // lit from above and in front
  if (Math.abs(u - 0.13) < minDot && Math.abs(y - 0.05) < minRow * 0.7) { sc = 111; sb = 1; sk = 3; return true; } // eye "o"
  const my = 0.3 + 1.0 * (u / 0.22) ** 1.4;
  if (u < 0.22 && Math.abs(y - my) < minRow * 0.5) { sc = 45; sb = 0.55; sk = 2; return true; } // mouth line "-"
  if (u > 0.06 && u < 0.5 && y > bot - 0.9 * (1 - smooth(0.3, 0.5, u)) && Math.floor(y / minRow) % 2 === 0) {
    sc = 61; sb = 0.4; sk = 1; return true; // throat groove "="
  }
  const idx = clamp(Math.round(light * 12), 1, 13);
  sc = RAMP.charCodeAt(idx); sb = idx / 13; sk = 0;
  return true;
}

export function startSkySea(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) { canvas.remove(); return; }
  const g = ctx;

  // Hidden probes so the colours are read from the CSS tokens (and follow the theme).
  const probes = [0, 1].map((hot) => {
    const el = document.createElement("span");
    el.className = hot ? "sky-probe hot" : "sky-probe";
    canvas.parentElement?.appendChild(el);
    return el;
  });
  const glyphs: string[] = [];
  for (let i = 0; i < 256; i++) glyphs.push(String.fromCharCode(i));

  // ---- state that only changes on resize ----
  let cols = 0, rows = 0, cw = 8, ch = 10, dpr = 1, fs = 10, cssW = 0, cssH = 0, mono = "monospace";
  let whaleLen = 70, H = 7; // whale length in cells; H in cell widths
  let bc = new Uint8Array(0), bb = new Float32Array(0); // back clouds
  let wc = new Uint8Array(0), wb = new Float32Array(0), wk = new Float32Array(0); // whale + spray
  let fc = new Uint8Array(0), fb = new Float32Array(0), fd = new Float32Array(0); // front clouds
  let bd = new Float32Array(0); // back cloud density
  const sx = new Float32Array(310), sy = new Float32Array(310), nx = new Float32Array(310), ny = new Float32Array(310); // the bent spine
  const boxes = new Float32Array(8); // cell boxes of .landing-card and .tree
  const whalePal: string[] = [], cloudPal: string[] = [];
  let ghost = ""; // light theme only: the faint dot colour used under the card
  const glow = document.createElement("canvas"); // whale-only layer, blurred to make the glow
  const gg = glow.getContext("2d");

  // Spray and wake particles (a fixed pool, nothing is created while running).
  const P = 64;
  const px = new Int32Array(P), py = new Int32Array(P), life = new Int16Array(P), maxLife = new Int16Array(P), pch = new Uint8Array(P), pvx = new Int8Array(P), pvy = new Int8Array(P);

  let light = false, tick = 0, still = false, phase = 0, stillHead = 0;
  let reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let onScreen = true, ready = false, raf = 0, last = 0, acc = 0;

  function readColours() {
    // Computed colours come back as rgb(0-255) or, for color-mix(), as color(srgb 0-1).
    const rgb = (el: Element) => {
      const c = getComputedStyle(el).color, n = (c.match(/[\d.]+/g) || ["255", "90", "46"]).map(Number);
      return c.startsWith("color(") ? n.map((v) => v * 255) : n;
    };
    const ink = rgb(probes[0]), hot = rgb(probes[1]);
    // The hot colour is dark on the light theme; there, faint cells need a higher floor to show on paper.
    light = 0.2126 * hot[0] + 0.7152 * hot[1] + 0.0722 * hot[2] < 128;
    ghost = `rgba(${ink[0]},${ink[1]},${ink[2]},0.16)`;
    for (let i = 0; i < LEVELS; i++) {
      const b = i / (LEVELS - 1), m = smooth(0.4, 0.85, b), a = (light ? 0.3 + 0.7 * b : 0.1 + 0.9 * b).toFixed(2);
      cloudPal[i] = `rgba(${ink[0]},${ink[1]},${ink[2]},${a})`;
      whalePal[i] = `rgba(${Math.round(lerp(ink[0], hot[0], m))},${Math.round(lerp(ink[1], hot[1], m))},${Math.round(lerp(ink[2], hot[2], m))},${(light ? 0.55 + 0.45 * b : 0.3 + 0.7 * b).toFixed(2)})`;
    }
  }

  // Where the glass card and the tree are, in cells, so the whale can fade behind them.
  function readBoxes() {
    const r = canvas.getBoundingClientRect();
    boxes.fill(0);
    [".landing-card", ".tree"].forEach((sel, i) => {
      const el = document.querySelector(sel);
      if (!el) return;
      const b = el.getBoundingClientRect();
      boxes.set([(b.left - r.left) / cw, (b.top - r.top) / ch, (b.right - r.left) / cw, (b.bottom - r.top) / ch], i * 4);
    });
  }
  // 0 outside a box, 1 inside, easing over a 2-cell edge.
  function cover(x: number, y: number) {
    let t = 0;
    for (let i = 0; i < 8; i += 4) {
      if (boxes[i + 2] === 0) continue;
      const d = Math.max(boxes[i] - x, x - boxes[i + 2], boxes[i + 1] - y, y - boxes[i + 3], 0);
      if (d < 2) t = Math.max(t, 1 - d / 2);
    }
    return t;
  }

  // True just inside a box's edge, where the glass lens bends the backdrop.
  function onRim(x: number, y: number) {
    for (let i = 0; i < 8; i += 4) {
      if (boxes[i + 2] === 0) continue;
      const dx = Math.min(x - boxes[i], boxes[i + 2] - x) * cw, dy = Math.min(y - boxes[i + 1], boxes[i + 3] - y) * ch;
      if (dx > 0 && dy > 0 && Math.min(dx, dy) < RIM_PX) return true;
    }
    return false;
  }

  function resize() {
    cssW = canvas.clientWidth; cssH = canvas.clientHeight;
    if (!cssW || !cssH) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssW * dpr); canvas.height = Math.round(cssH * dpr);
    fs = clamp(0.0075 * window.innerWidth, 9, 13);
    glow.width = canvas.width; glow.height = canvas.height;
    g.setTransform(dpr, 0, 0, dpr, 0, 0); gg?.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.font = `${fs}px ${mono}`; g.textBaseline = "top";
    cw = g.measureText("M").width; ch = fs * 1.15;
    cols = Math.ceil(cssW / cw); rows = Math.ceil(cssH / ch);
    whaleLen = clamp(Math.round(0.55 * cols), 80, 150); H = whaleLen * 0.1;
    minRow = Math.max(1 / 6, (ch / cw) / H); minDot = Math.max(0.014, 0.5 / whaleLen);
    const n = cols * rows;
    bc = new Uint8Array(n); bb = new Float32Array(n);
    wc = new Uint8Array(n); wb = new Float32Array(n); wk = new Float32Array(n);
    fc = new Uint8Array(n); fb = new Float32Array(n); fd = new Float32Array(n);
    bd = new Float32Array(n);
    backClouds = makeClouds(6, 7, 25, 45, 6, 10); frontClouds = makeClouds(4, 21, 40, 70, 9, 14);
    readBoxes();
    draw();
  }

  // ---- clouds: puffy cumulus made of overlapping circles, scrolling left a whole cell at a time ----
  // Each cloud is 5-9 circles (in physical units, so they stay round on 2:1 cells) with a flat bottom. Positions are seeded.
  type Cloud = { n: number; x: Float32Array; w: Float32Array; base: Float32Array; ci: Float32Array; wrap: number; seed: number };
  function makeClouds(n: number, seed: number, minW: number, maxW: number, minH: number, maxH: number): Cloud {
    const asp = ch / cw, wrap = cols + maxW + 10;
    const r = (k: number, j: number) => hash(k, j, seed);
    const cl: Cloud = { n, x: new Float32Array(n), w: new Float32Array(n), base: new Float32Array(n), ci: new Float32Array(n * 9 * 3), wrap, seed };
    for (let k = 0; k < n; k++) {
      const w = lerp(minW, maxW, r(k, 1)), hr = lerp(minH, maxH, r(k, 2));
      const band = [0.15, 0.55, 0.88][k % 3];
      const base = (band * rows + hr / 2) * asp + (r(k, 3) - 0.5) * 4 * asp;
      cl.x[k] = ((k + r(k, 4) * 0.8) / n) * wrap; cl.w[k] = w; cl.base[k] = base;
      const count = 5 + Math.floor(r(k, 5) * 5);
      for (let j = 0; j < 9; j++) {
        const o = (k * 9 + j) * 3;
        if (j >= count) { cl.ci[o + 2] = 0; continue; }
        const t = count > 1 ? j / (count - 1) : 0.5, bump = Math.sin(Math.PI * t);
        const rad = hr * asp * (0.3 + 0.28 * bump) * (0.8 + 0.4 * r(k * 9 + j, 6));
        cl.ci[o] = w * (0.12 + 0.76 * t); cl.ci[o + 1] = base - rad * 0.75; cl.ci[o + 2] = rad;
      }
    }
    return cl;
  }
  let backClouds = makeClouds(0, 1, 1, 1, 1, 1), frontClouds = backClouds;

  function puffs(cl: Cloud, c: Uint8Array, b: Float32Array, d: Float32Array, offset: number, maxB: number) {
    const asp = ch / cw;
    d.fill(0);
    for (let k = 0; k < cl.n; k++) {
      const left = Math.floor((((cl.x[k] - offset) % cl.wrap) + cl.wrap) % cl.wrap) - (cl.wrap - cols - 10);
      const x0 = Math.max(0, left), x1 = Math.min(cols - 1, left + Math.ceil(cl.w[k]) + 1);
      for (let x = x0; x <= x1; x++) {
        const lx = x - left;
        for (let y = 0; y < rows; y++) {
          const yp = (y + 0.5) * asp;
          const cut = 1 - smooth(cl.base[k] - asp, cl.base[k] + asp, yp); // flat bottom
          if (cut <= 0) continue;
          let best = 0;
          for (let j = 0; j < 9; j++) {
            const o = (k * 9 + j) * 3, rad = cl.ci[o + 2];
            if (rad <= 0) continue;
            const dist = Math.hypot(lx - cl.ci[o], yp - cl.ci[o + 1]) / rad;
            if (dist < 1.4) best = Math.max(best, 1 - dist);
          }
          if (best <= 0) continue;
          best += (fbm(x * 0.3, y * 0.25, cl.seed) - 0.5) * 0.9; // rough, billowy edge
          const dens = clamp(best * 1.8, 0, 1) * cut;
          const i = y * cols + x;
          if (dens > d[i]) d[i] = dens;
        }
      }
    }
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x, dens = d[i];
        if (dens < 0.08) { c[i] = 0; b[i] = 0; continue; }
        const above = y > 0 ? d[i - cols] : 0;
        const lit = above < dens * 0.6 ? 0.25 : 0; // top rims catch the light
        c[i] = CLOUD.charCodeAt(Math.min(6, Math.floor(dens * 7)));
        b[i] = Math.min(maxB, maxB * (0.4 + 0.35 * dens + lit));
      }
    }
  }

  // ---- the whale ----
  function splat(X: number, Y: number, code: number, b: number, key: number) {
    const x = Math.round(X), y = Math.round(Y / (ch / cw));
    if (x < 0 || y < 0 || x >= cols || y >= rows) return;
    const i = y * cols + x;
    if (!wc[i] || key + b > wk[i]) { wc[i] = code; wb[i] = b; wk[i] = key + b; }
  }

  function whale(headX: number, t: number) {
    const asp = ch / cw, L = whaleLen, N = Math.round(L * 2), lambda = 1.1 * cols;
    const amp = 0.17 * rows * asp, cy = 0.5 * rows * asp;
    // Walk back from the head along the sine path in half-cell steps, so the body follows the curve.
    let x = headX;
    for (let i = 0; i <= N; i++) {
      const th = (2 * Math.PI * x) / lambda + phase;
      const u = i / N;
      sx[i] = x;
      sy[i] = cy - amp * Math.sin(th) + 0.07 * L * u * u * Math.sin(2 * Math.PI * (u * 1.1 - t)); // tail beat
      const slope = -amp * Math.cos(th) * ((2 * Math.PI) / lambda);
      x -= 0.5 / Math.sqrt(1 + slope * slope);
    }
    for (let i = 0; i <= N; i++) {
      const a = Math.max(i - 1, 0), b = Math.min(i + 1, N);
      const tx = sx[a] - sx[b], ty = sy[a] - sy[b], m = Math.hypot(tx, ty) || 1;
      nx[i] = -ty / m; ny[i] = tx / m; // points down the whale's side
    }
    const dy = 0.5 / H;
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const lo = u > 0.84 ? -1.4 : -dorsal(u), hi = u > 0.84 ? 1.4 : ventral(u);
      for (let y = lo; y <= hi; y += dy) {
        if (body(u, y)) splat(sx[i] + y * H * nx[i], sy[i] + y * H * ny[i], sc, sb, sk);
      }
    }
    // Pectoral flipper: long, knobbly edge, rooted under the throat, pointing back and down.
    const ang = 0.75 + 0.17 * Math.sin(t * 1.6), ca = Math.cos(ang), sa = Math.sin(ang), len = 3;
    for (let al = 0; al <= len; al += dy) {
      const w = 0.4 * (1 - al / len) + 0.07;
      const knob = Math.sin(al * 7) > 0.2 ? 0.08 : 0; // knobs on the leading edge
      for (let ac = -w - knob; ac <= w; ac += dy) {
        const u = 0.24 + (al * ca - ac * sa) / 10, y = 0.95 + al * sa + ac * ca;
        const i = Math.round(u * N);
        if (i < 0 || i > N) continue;
        splat(sx[i] + y * H * nx[i], sy[i] + y * H * ny[i], ac < 0 ? 83 : 88, 0.85, 0.6);
      }
    }
    return Math.sin((2 * Math.PI * headX) / lambda + phase) > 0.9; // is the head near a peak?
  }

  function spawn(X: number, Y: number, code: number, vx: number, vy: number, ticks: number) {
    for (let i = 0; i < P; i++) {
      if (life[i] > 0) continue;
      px[i] = Math.round(X); py[i] = Math.round(Y / (ch / cw)); pch[i] = code; pvx[i] = vx; pvy[i] = vy;
      life[i] = maxLife[i] = ticks;
      return;
    }
  }
  function particles() {
    for (let i = 0; i < P; i++) {
      if (life[i] <= 0) continue;
      life[i]--;
      if (tick % 2 === 0) { px[i] += pvx[i]; py[i] += pvy[i]; }
      const x = px[i], y = py[i];
      if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
      const k = y * cols + x;
      if (!wc[k]) { wc[k] = pch[i]; wb[k] = 0.15 + 0.7 * (life[i] / maxLife[i]); wk[k] = 0; }
    }
  }

  function build() {
    const t = tick / 10;
    puffs(backClouds, bc, bb, bd, still ? 0 : Math.floor(tick / 3), 0.35);
    puffs(frontClouds, fc, fb, fd, still ? 0 : tick, 0.8);
    wc.fill(0); wb.fill(0); wk.fill(0);
    const pt = tick % CYCLE_TICKS;
    if (!still && pt >= MOVE_TICKS) { particles(); return; }
    const headX = still ? stillHead : Math.round(((cols + whaleLen) * pt) / MOVE_TICKS);
    const peak = whale(headX, still ? 0 : t);
    if (still) return;
    const asp = ch / cw, N = Math.round(whaleLen * 2);
    if (peak && Math.random() < 0.5) { // spray from the blowhole
      const i = Math.round(0.14 * N);
      spawn(sx[i] - 0.6 * H * nx[i], sy[i] - 0.6 * H * ny[i] - asp, "o.\xb0".charCodeAt((Math.random() * 3) | 0), 0, -1, 10 + ((Math.random() * 20) | 0));
    }
    if (Math.random() < 0.3) spawn(sx[N], sy[N], ".:'".charCodeAt((Math.random() * 3) | 0), -1, 0, 10 + ((Math.random() * 20) | 0));
    particles();
  }

  function draw() {
    if (!cols || !whalePal.length) return;
    build();
    g.clearRect(0, 0, cssW, cssH); gg?.clearRect(0, 0, cssW, cssH);
    g.font = `${fs}px ${mono}`; g.textBaseline = "top";
    if (gg) { gg.font = g.font; gg.textBaseline = "top"; }
    let lastStyle = "";
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x;
        let c = bc[i], b = bb[i], isWhale = false;
        if (wc[i]) { c = wc[i]; b = wb[i]; isWhale = true; }
        if (fc[i] && (fd[i] > 0.35 || !wc[i])) { c = fc[i]; b = fb[i]; isWhale = false; } // front clouds hide the whale
        if (!c) continue;
        const rim = onRim(x + 0.5, y + 0.5), cv = cover(x + 0.5, y + 0.5);
        // The rim keeps real glyphs (dimmed) so the lens has something to bend and split into colour.
        if (light && cv === 1 && !rim) {
          // On paper, faded glyphs still read as noise behind the text: show only a faint dotted outline, no glow.
          if (b < 0.25) continue;
          if (ghost !== lastStyle) g.fillStyle = lastStyle = ghost;
          g.fillText(b > 0.55 ? ":" : ".", x * cw, y * ch);
          continue;
        }
        b *= rim ? RIM_KEEP : 1 - (isWhale ? 1 - FADE : 1 - CLOUD_FADE) * cv;
        const lvl = Math.round(b * (LEVELS - 1));
        if (lvl <= 0) continue;
        const style = isWhale ? whalePal[lvl] : cloudPal[lvl];
        if (style !== lastStyle) g.fillStyle = lastStyle = style;
        g.fillText(glyphs[c], x * cw, y * ch);
        if (isWhale && gg && !rim) { gg.fillStyle = style; gg.fillText(glyphs[c], x * cw, y * ch); }
      }
    }
    { // soft glow: the finished frame, blurred, added back on top
      g.save();
      // Adding light vanishes on paper, so the light theme darkens instead.
      g.globalCompositeOperation = light ? "multiply" : "lighter"; g.globalAlpha = light ? 0.5 : 0.9; g.filter = `blur(${5 * dpr}px)`;
      g.drawImage(glow, 0, 0, cssW, cssH);
      g.restore();
    }
  }

  // ---- running, pausing, reacting to changes ----
  function frame(now: number) {
    raf = 0;
    if (!running()) return;
    acc += Math.min(now - last, 500); last = now;
    if (acc >= TICK_MS) { acc %= TICK_MS; tick++; draw(); }
    raf = requestAnimationFrame(frame);
  }
  const running = () => ready && !reduced && onScreen && !document.hidden;
  function update() {
    if (reduced) { // one still frame: the whale at the top of its arc, middle-right
      still = true;
      const lambda = 1.1 * cols;
      stillHead = Math.round(0.78 * cols);
      phase = Math.PI / 2 - (2 * Math.PI * (stillHead - 0.3 * whaleLen)) / lambda;
      draw();
    } else { still = false; phase = 0; }
    if (running() && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  }

  const ro = new ResizeObserver(() => { resize(); });
  const refresh = () => { readColours(); readBoxes(); if (!running()) draw(); };
  document.fonts.ready.then(() => {
    mono = getComputedStyle(document.documentElement).getPropertyValue("--mono").trim() || "monospace";
    readColours();
    ready = true;
    ro.observe(canvas);
    resize();
    update();
  });
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; update(); }).observe(canvas);
  document.addEventListener("visibilitychange", update);
  window.addEventListener("scroll", readBoxes, { passive: true });
  setInterval(readBoxes, 2000); // the card slides in when the page loads, so check again now and then
  new MutationObserver(refresh).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", refresh);
  matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", (e) => { reduced = e.matches; update(); });
}
