// Utilidades compartidas entre anfitrión y jugador
const SHAPES = {
  triangle: '<polygon points="12,3 22.5,21 1.5,21"/>',
  diamond: '<polygon points="12,1.5 22.5,12 12,22.5 1.5,12"/>',
  circle: '<circle cx="12" cy="12" r="10.5"/>',
  square: '<rect x="2.5" y="2.5" width="19" height="19" rx="2.5"/>',
  star: '<polygon points="12,1.5 15,8.4 22.5,9.1 16.8,14.1 18.5,21.5 12,17.6 5.5,21.5 7.2,14.1 1.5,9.1 9,8.4"/>'
};
const shapeSvg = (s) => `<svg class="shape" viewBox="0 0 24 24" aria-hidden="true">${SHAPES[s] || SHAPES.circle}</svg>`;
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
function show(id) { $$(".screen").forEach((el) => (el.hidden = el.id !== id)); }

// Reloj sincronizado con el servidor
let clockOffset = 0;
const syncClock = (d) => { if (d && d.now) clockOffset = d.now - Date.now(); };
const serverNow = () => Date.now() + clockOffset;

// Sonido sintetizado (no requiere archivos)
const Sound = {
  on: true, ctx: null,
  unlock() { try { this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)(); this.ctx.resume(); } catch (e) {} },
  tone(freq, dur = 0.12, type = "sine", vol = 0.12, when = 0) {
    if (!this.on || !this.ctx) return;
    const t = this.ctx.currentTime + when, o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.ctx.destination); o.start(t); o.stop(t + dur + 0.02);
  },
  tick() { this.tone(880, 0.06, "square", 0.05); },
  go() { this.tone(523, 0.12, "triangle"); this.tone(784, 0.18, "triangle", 0.12, 0.1); },
  reveal() { [523, 659, 784].forEach((f, i) => this.tone(f, 0.25, "triangle", 0.1, i * 0.08)); },
  good() { this.tone(660, 0.12, "triangle"); this.tone(990, 0.22, "triangle", 0.12, 0.09); },
  bad() { this.tone(220, 0.3, "sawtooth", 0.06); },
  drum(n = 1) { for (let i = 0; i < n; i++) this.tone(110, 0.1, "square", 0.08, i * 0.12); },
  fanfare() { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => this.tone(f, i === 5 ? 0.6 : 0.18, "triangle", 0.12, i * 0.14)); }
};

// Confeti en canvas
function confetti(ms = 4500) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const c = document.createElement("canvas");
  c.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:50";
  document.body.appendChild(c);
  const x = c.getContext("2d"), dpr = devicePixelRatio || 1;
  const size = () => { c.width = innerWidth * dpr; c.height = innerHeight * dpr; };
  size(); addEventListener("resize", size);
  const cols = ["#3D5AFE", "#E8590C", "#0E9F8E", "#F2B705", "#9C36B5", "#F3F4FF"];
  const P = Array.from({ length: 180 }, () => ({
    x: Math.random() * c.width, y: -Math.random() * c.height * 0.6, w: (6 + Math.random() * 8) * dpr, h: (8 + Math.random() * 10) * dpr,
    vy: (2 + Math.random() * 3.5) * dpr, vx: (Math.random() - 0.5) * 2.5 * dpr, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.2, c: cols[(Math.random() * cols.length) | 0]
  }));
  const end = performance.now() + ms;
  (function f(t) {
    x.clearRect(0, 0, c.width, c.height);
    P.forEach((p) => { p.x += p.vx; p.y += p.vy; p.r += p.vr; if (p.y > c.height && t < end - 1200) { p.y = -20; p.x = Math.random() * c.width; }
      x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2))); x.restore(); });
    if (t < end) requestAnimationFrame(f); else c.remove();
  })(performance.now());
}
