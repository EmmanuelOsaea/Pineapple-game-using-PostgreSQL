/**
 * Minimal but structured Canvas game loop:
 * - Player (pineapple) moves only by player input
 * - Coins spawn and increase score
 * - Hazards spawn (rockets, bombs, etc.) and reduce lives
 * - On game over: allow submit score to backend
 */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const ui = {
  score: document.getElementById("score"),
  best: document.getElementById("best"),
  lives: document.getElementById("lives"),
  start: document.getElementById("btnStart"),
  submit: document.getElementById("btnSubmit"),
};

const API_BASE = ""; // same origin (served by Express)

const state = {
  running: false,
  score: 0,
  lives: 3,
  best: null,
  tPrev: 0,
  keys: new Set(),
  player: { x: 120, y: 270, r: 22, vx: 0, vy: 0, speed: 720 },
  coins: [],
  hazards: [],
  spawn: { coinIn: 0, hazardIn: 0 },
};

function resizeForDpr(){
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const cssW = canvas.getBoundingClientRect().width;
  const cssH = cssW * (540/960);
  canvas.style.height = cssH + "px";
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
window.addEventListener("resize", resizeForDpr);

function reset(){
  state.score = 0;
  state.lives = 3;
  state.player.x = 120;
  state.player.y = 270;
  state.player.vx = 0;
  state.player.vy = 0;
  state.coins.length = 0;
  state.hazards.length = 0;
  state.spawn.coinIn = 0.4;
  state.spawn.hazardIn = 1.2;
  ui.submit.disabled = true;
  syncHud();
}

function syncHud(){
  ui.score.textContent = String(state.score);
  ui.lives.textContent = String(state.lives);
  ui.best.textContent = state.best == null ? "—" : String(state.best);
}

function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
function rand(a,b){ return a + Math.random()*(b-a); }

function circleHit(a,b){
  const dx = a.x - b.x, dy = a.y - b.y;
  const r = a.r + b.r;
  return dx*dx + dy*dy <= r*r;
}

function spawnCoin(){
  state.coins.push({ x: rand(220, 920), y: rand(60, 480), r: 12 });
}
function spawnHazard(){
  // simple moving projectile from right to left
  const type = Math.random() < 0.5 ? "rocket" : "bomb";
  state.hazards.push({
    type,
    x: 980,
    y: rand(70, 470),
    r: type === "rocket" ? 14 : 18,
    vx: type === "rocket" ? -520 : -320
  });
}

function update(dt){
  // input
  const p = state.player;
  let ix = 0, iy = 0;
  if (state.keys.has("ArrowLeft") || state.keys.has("a")) ix -= 1;
  if (state.keys.has("ArrowRight")|| state.keys.has("d")) ix += 1;
  if (state.keys.has("ArrowUp")   || state.keys.has("w")) iy -= 1;
  if (state.keys.has("ArrowDown") || state.keys.has("s")) iy += 1;

  // normalized movement
  const len = Math.hypot(ix, iy) || 1;
  p.vx = (ix/len) * p.speed;
  p.vy = (iy/len) * p.speed;

  p.x += p.vx * dt;
  p.y += p.vy * dt;

  // bounds in CSS pixels (canvas is scaled via setTransform)
  p.x = clamp(p.x, p.r, 960 - p.r);
  p.y = clamp(p.y, p.r, 540 - p.r);

  // spawns
  state.spawn.coinIn -= dt;
  state.spawn.hazardIn -= dt;
  if (state.spawn.coinIn <= 0){ spawnCoin(); state.spawn.coinIn = rand(0.25, 0.65); }
  if (state.spawn.hazardIn <= 0){ spawnHazard(); state.spawn.hazardIn = rand(0.55, 1.05); }

  // hazards movement
  for (const h of state.hazards){ h.x += h.vx * dt; }
  state.hazards = state.hazards.filter(h => h.x > -40);

  // collisions: coins
  for (let i = state.coins.length - 1; i >= 0; i--){
    if (circleHit(p, state.coins[i])){
      state.coins.splice(i,1);
      state.score += 10;
    }
  }

  // collisions: hazards
  for (let i = state.hazards.length - 1; i >= 0; i--){
    if (circleHit(p, state.hazards[i])){
      state.hazards.splice(i,1);
      state.lives -= 1;
      if (state.lives <= 0){
        gameOver();
        return;
      }
    }
  }

  syncHud();
}

function draw(){
  // clear
  ctx.clearRect(0,0,960,540);

  // background grid
  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.strokeStyle = "rgba(255,255,255,.10)";
  for (let x=0; x<=960; x+=40){
    ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,540); ctx.stroke();
  }
  for (let y=0; y<=540; y+=40){
    ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(960,y); ctx.stroke();
  }
  ctx.restore();

  // coins
  for (const c of state.coins){
    ctx.beginPath();
    ctx.fillStyle = "rgba(183,255,74,.95)";
    ctx.arc(c.x,c.y,c.r,0,Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,.35)";
    ctx.stroke();
  }

  // hazards
  for (const h of state.hazards){
    ctx.beginPath();
    ctx.fillStyle = h.type === "rocket" ? "rgba(255,61,141,.95)" : "rgba(255,181,71,.95)";
    ctx.arc(h.x,h.y,h.r,0,Math.PI*2);
    ctx.fill();
  }

  // pineapple (placeholder circle)
  const p = state.player;
  ctx.beginPath();
  ctx.fillStyle = "rgba(243,242,255,.92)";
  ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,.35)";
  ctx.stroke();
}

function loop(ts){
  if (!state.running) return;
  const t = ts / 1000;
  const dt = Math.min(0.033, t - (state.tPrev || t));
  state.tPrev = t;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

function gameOver(){
  state.running = false;
  ui.submit.disabled = false;
}

async function loadBest(){
  try{
    const res = await fetch(API_BASE + "/api/scores/best");
    if (!res.ok) return;
    const data = await res.json();
    state.best = data.bestScore ?? null;
    syncHud();
  } catch {}
}

async function submitScore(){
  const name = prompt("Name for leaderboard (1-20 chars):", "player");
  if (!name) return;

  const payload = { playerName: name.slice(0,20), score: state.score };

  const res = await fetch(API_BASE + "/api/scores", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok){
    alert("Failed to submit score.");
    return;
  }
  await loadBest();
  alert("Score submitted!");
  ui.submit.disabled = true;
}

ui.start.addEventListener("click", () => {
  reset();
  state.running = true;
  state.tPrev = 0;
  requestAnimationFrame(loop);
});

ui.submit.addEventListener("click", submitScore);

window.addEventListener("keydown", (e) => {
  if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)) e.preventDefault();
  state.keys.add(e.key);
});
window.addEventListener("keyup", (e) => state.keys.delete(e.key));

// touch: drag to move
let dragging = false;
canvas.addEventListener("pointerdown", () => dragging = true);
window.addEventListener("pointerup", () => dragging = false);
canvas.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (960 / rect.width);
  const y = (e.clientY - rect.top) * (540 / rect.height);
  state.player.x = clamp(x, state.player.r, 960 - state.player.r);
  state.player.y = clamp(y, state.player.r, 540 - state.player.r);
});

resizeForDpr();
loadBest();
