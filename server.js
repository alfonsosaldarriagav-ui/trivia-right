// Trivia en vivo estilo Kahoot — servidor (Node.js + Socket.IO)
const express = require("express");
const http = require("http");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const { Server } = require("socket.io");
const C = require("./questions");

const PORT = process.env.PORT || 3000;
const PREVIEW_MS = (C.previewSeconds ?? 4) * 1000;
const MAX_NAME = 16;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const pub = path.join(__dirname, "public");
app.use(express.static(pub, { index: false }));
app.get("/", (_, res) => res.sendFile(path.join(pub, "index.html")));
app.get("/host", (_, res) => res.sendFile(path.join(pub, "host.html")));
app.get("/play", (_, res) => res.sendFile(path.join(pub, "play.html")));
app.get("/api/info", (_, res) => res.json({ lan: lanIP(), port: PORT }));

function lanIP() {
  for (const list of Object.values(os.networkInterfaces()))
    for (const n of list || []) if (n.family === "IPv4" && !n.internal) return n.address;
  return null;
}

// ── Estado ───────────────────────────────────────────────────
const games = new Map(); // pin -> game

function newPin() {
  let p;
  do p = String(Math.floor(100000 + Math.random() * 900000)); while (games.has(p));
  return p;
}
const publicSolutions = () => C.solutions.map(({ id, name, color, ink, shape }) => ({ id, name, color, ink, shape }));
const ranked = (g) => [...g.players.values()].sort((a, b) => b.score - a.score || a.joinedAt - b.joinedAt);
const connected = (g) => [...g.players.values()].filter((p) => p.connected);

function emitHost(g, ev, data = {}, remember = true) {
  if (remember) g.lastHost = { ev, data };
  if (g.hostSocket) io.to(g.hostSocket).emit(ev, { ...data, now: Date.now() });
}
function emitPlayer(g, p, ev, data = {}, remember = true) {
  if (remember) p.last = { ev, data };
  if (p.socketId) io.to(p.socketId).emit(ev, { ...data, now: Date.now() });
}
function roster(g) {
  if (!g.hostSocket) return;
  io.to(g.hostSocket).emit("roster", {
    players: [...g.players.values()].sort((a, b) => a.joinedAt - b.joinedAt).map((p) => ({ name: p.name, connected: p.connected })),
  });
}
function answerCount(g) {
  if (g.hostSocket) io.to(g.hostSocket).emit("answerCount", { n: g.answers, of: connected(g).length });
}

// ── Flujo del juego ──────────────────────────────────────────
function toLobby(g) {
  clearTimeout(g.timer);
  g.state = "lobby"; g.qi = -1; g.answers = 0;
  for (const p of g.players.values()) Object.assign(p, { score: 0, streak: 0, correct: 0, answer: null, rank: null, prevRank: null });
  emitHost(g, "lobby", { pin: g.pin, title: C.title, subtitle: C.subtitle, total: C.questions.length });
  for (const p of g.players.values()) emitPlayer(g, p, "lobby", { name: p.name });
  roster(g);
}

function startQuestion(g) {
  clearTimeout(g.timer);
  g.qi++;
  const q = C.questions[g.qi];
  const time = q.time || C.timePerQuestion;
  g.state = "question"; g.answers = 0; g.time = time;
  g.openAt = Date.now() + PREVIEW_MS;
  g.closeAt = g.openAt + time * 1000;
  for (const p of g.players.values()) p.answer = null;
  const lv = C.levels[q.lvl];
  const common = { i: g.qi, total: C.questions.length, level: lv.name, lvl: q.lvl, points: lv.points, type: q.type, openAt: g.openAt, closeAt: g.closeAt, time };
  emitHost(g, "question", { ...common, text: q.text, context: q.context || "", said: !!q.said });
  g.playerQuestion = common;
  for (const p of g.players.values()) emitPlayer(g, p, "question", common);
  answerCount(g);
  g.timer = setTimeout(() => reveal(g), g.closeAt - Date.now() + 400);
}

function handleAnswer(g, p, choice) {
  if (g.state !== "question" || p.answer) return;
  const now = Date.now();
  if (now < g.openAt - 250 || now > g.closeAt + 600) return;
  if (!C.solutions.some((s) => s.id === choice)) return;
  const q = C.questions[g.qi];
  const ms = Math.max(0, Math.min(now - g.openAt, g.time * 1000));
  const ok = choice === q.answer;
  let pts = 0, bonus = 0;
  if (ok) {
    // Estilo Kahoot: entre 50% y 100% del puntaje según la velocidad
    pts = Math.round(C.levels[q.lvl].points * (1 - ms / (g.time * 1000) / 2));
    p.streak++; p.correct++;
    if (p.streak >= 3) bonus = C.streakBonus;
  } else p.streak = 0;
  p.score += pts + bonus;
  p.answer = { choice, ok, pts, bonus, ms };
  g.answers++;
  emitPlayer(g, p, "answered", { choice });
  answerCount(g);
  checkAllAnswered(g);
}
function checkAllAnswered(g) {
  const c = connected(g);
  if (g.state === "question" && c.length > 0 && c.every((p) => p.answer)) {
    clearTimeout(g.timer);
    g.timer = setTimeout(() => reveal(g), 700);
  }
}

function reveal(g) {
  if (g.state !== "question") return;
  clearTimeout(g.timer);
  g.state = "reveal";
  const q = C.questions[g.qi];
  const counts = Object.fromEntries(C.solutions.map((s) => [s.id, 0]));
  for (const p of g.players.values()) {
    if (p.answer) counts[p.answer.choice]++;
    else p.streak = 0;
    p.prevRank = p.rank;
  }
  const r = ranked(g);
  r.forEach((p, i) => (p.rank = i + 1));
  const fastest = [...g.players.values()].filter((p) => p.answer?.ok).sort((a, b) => a.answer.ms - b.answer.ms)[0];
  emitHost(g, "reveal", {
    i: g.qi, total: C.questions.length, text: q.text, answer: q.answer, why: q.why, ref: q.ref,
    counts, answered: g.answers, players: g.players.size,
    correct: [...g.players.values()].filter((p) => p.answer?.ok).length,
    fastest: fastest ? { name: fastest.name, secs: +(fastest.answer.ms / 1000).toFixed(1) } : null,
    last: g.qi === C.questions.length - 1,
  });
  r.forEach((p, i) => {
    const ahead = i > 0 ? r[i - 1] : null;
    emitPlayer(g, p, "result", {
      answered: !!p.answer, ok: !!p.answer?.ok, choice: p.answer?.choice || null, answer: q.answer,
      gained: p.answer?.pts || 0, bonus: p.answer?.bonus || 0, score: p.score, streak: p.streak,
      rank: i + 1, of: r.length, ahead: ahead ? { name: ahead.name, gap: ahead.score - p.score } : null,
    });
  });
}

function leaderboard(g) {
  g.state = "leaderboard";
  const r = ranked(g);
  emitHost(g, "leaderboard", {
    i: g.qi, total: C.questions.length,
    top: r.slice(0, 5).map((p) => ({ name: p.name, score: p.score, rank: p.rank, move: p.prevRank ? p.prevRank - p.rank : 0, streak: p.streak })),
  });
}

function podium(g) {
  clearTimeout(g.timer);
  g.state = "podium";
  const r = ranked(g);
  emitHost(g, "podium", { ranking: r.map((p, i) => ({ rank: i + 1, name: p.name, score: p.score, correct: p.correct })), total: C.questions.length });
  r.forEach((p, i) => emitPlayer(g, p, "final", { rank: i + 1, of: r.length, score: p.score, correct: p.correct, total: C.questions.length }));
}

function advance(g) {
  switch (g.state) {
    case "lobby": if (g.players.size) startQuestion(g); break;
    case "question": reveal(g); break;
    case "reveal": g.qi === C.questions.length - 1 ? podium(g) : leaderboard(g); break;
    case "leaderboard": startQuestion(g); break;
  }
}

// ── Conexiones ───────────────────────────────────────────────
io.on("connection", (socket) => {
  // Anfitrión
  socket.on("host:create", (_, cb) => {
    const pin = newPin();
    const key = crypto.randomBytes(12).toString("hex");
    const g = { pin, key, hostSocket: socket.id, players: new Map(), state: "lobby", qi: -1, answers: 0, createdAt: Date.now() };
    games.set(pin, g);
    socket.data = { role: "host", pin };
    cb?.({ ok: true, pin, key, solutions: publicSolutions() });
    toLobby(g);
  });

  socket.on("host:resume", ({ pin, key } = {}, cb) => {
    const g = games.get(pin);
    if (!g || g.key !== key) return cb?.({ ok: false });
    clearTimeout(g.cleanup);
    g.hostSocket = socket.id;
    socket.data = { role: "host", pin };
    cb?.({ ok: true, pin, key, solutions: publicSolutions() });
    roster(g);
    if (g.lastHost) emitHost(g, g.lastHost.ev, g.lastHost.data);
    if (g.state === "question") answerCount(g);
  });

  const hostGame = () => (socket.data?.role === "host" ? games.get(socket.data.pin) : null);
  socket.on("host:next", () => { const g = hostGame(); if (g) advance(g); });
  socket.on("host:restart", () => { const g = hostGame(); if (g) toLobby(g); });
  socket.on("host:kick", ({ name } = {}) => {
    const g = hostGame(); if (!g) return;
    for (const [cid, p] of g.players) if (p.name === name) {
      emitPlayer(g, p, "kicked", {}, false);
      g.players.delete(cid);
    }
    roster(g); if (g.state === "question") { answerCount(g); checkAllAnswered(g); }
  });

  // Jugador
  socket.on("player:join", ({ pin, name, cid } = {}, cb) => {
    pin = String(pin || "").replace(/\D/g, "");
    const g = games.get(pin);
    if (!g) return cb?.({ ok: false, error: "No encontramos una partida con ese PIN." });
    cid = String(cid || "").slice(0, 64);
    let p = cid && g.players.get(cid);
    if (p) {
      // Reconexión: conserva puntaje
      p.socketId = socket.id; p.connected = true;
    } else {
      name = String(name || "").replace(/\s+/g, " ").trim().slice(0, MAX_NAME);
      if (!name) return cb?.({ ok: false, error: "Escribe tu nombre para entrar." });
      if ([...g.players.values()].some((x) => x.name.toLowerCase() === name.toLowerCase()))
        return cb?.({ ok: false, error: "Ese nombre ya está en uso. Prueba con otro." });
      cid = crypto.randomBytes(10).toString("hex");
      p = { cid, name, socketId: socket.id, connected: true, joinedAt: Date.now(), score: 0, streak: 0, correct: 0, answer: null, rank: null, prevRank: null };
      g.players.set(cid, p);
    }
    socket.data = { role: "player", pin, cid };
    cb?.({ ok: true, cid, pin, name: p.name, title: C.title, solutions: publicSolutions() });
    if (p.last) emitPlayer(g, p, p.last.ev, p.last.data);
    else if (g.state === "lobby") emitPlayer(g, p, "lobby", { name: p.name });
    else if (g.state === "question") emitPlayer(g, p, "question", g.playerQuestion);
    else emitPlayer(g, p, "wait", { msg: "Entraste a mitad de partida. Juegas desde la próxima pregunta." });
    roster(g);
    if (g.state === "question") answerCount(g);
  });

  socket.on("player:answer", ({ choice } = {}) => {
    const { role, pin, cid } = socket.data || {};
    if (role !== "player") return;
    const g = games.get(pin); const p = g?.players.get(cid);
    if (p) handleAnswer(g, p, choice);
  });

  socket.on("disconnect", () => {
    const { role, pin, cid } = socket.data || {};
    const g = games.get(pin); if (!g) return;
    if (role === "host" && g.hostSocket === socket.id) {
      g.hostSocket = null;
      g.cleanup = setTimeout(() => {
        for (const p of g.players.values()) emitPlayer(g, p, "ended", {}, false);
        games.delete(pin);
      }, 30 * 60 * 1000); // la partida espera 30 min a que vuelva el anfitrión
    } else if (role === "player") {
      const p = g.players.get(cid);
      if (p && p.socketId === socket.id) { p.connected = false; p.socketId = null; roster(g); if (g.state === "question") { answerCount(g); checkAllAnswered(g); } }
    }
  });
});

server.listen(PORT, () => {
  const ip = lanIP();
  console.log(`\n  Trivia en vivo lista`);
  console.log(`  Anfitrión (proyector):  http://localhost:${PORT}/host`);
  if (ip) console.log(`  Jugadores (misma red):  http://${ip}:${PORT}/play\n`);
});
