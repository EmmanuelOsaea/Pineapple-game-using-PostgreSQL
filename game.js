:root{
  --bg:#07060a;
  --panel:rgba(255,255,255,.06);
  --stroke:rgba(255,255,255,.14);
  --ink:#f3f2ff;
  --muted:rgba(243,242,255,.72);
  --acid:#b7ff4a;
  --pink:#ff3d8d;
}

html,body{height:100%}
body{
  margin:0;
  color:var(--ink);
  background: radial-gradient(900px 500px at 20% 10%, rgba(183,255,74,.15), transparent 55%),
              radial-gradient(900px 500px at 90% 15%, rgba(77,227,255,.12), transparent 55%),
              linear-gradient(180deg, #07060a, #0b0a12);
  font-family: system-ui;
}

.topbar{
  display:flex;
  flex-wrap:wrap;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  padding: 14px 16px;
  border-bottom:1px solid var(--stroke);
  background: rgba(0,0,0,.25);
}

h1{margin:0; font-size:16px; letter-spacing:.02em; text-transform:uppercase}
.hud{display:flex; gap:12px; flex-wrap:wrap}
.hudItem{color:var(--muted); font-size:13px}
.actions{display:flex; gap:10px}

button{
  border:1px solid var(--stroke);
  background: var(--panel);
  color: var(--ink);
  padding: 10px 12px;
  border-radius: 12px;
  cursor:pointer;
}
button:hover{border-color: rgba(255,255,255,.24)}
button:disabled{opacity:.5; cursor:not-allowed}

main{padding: 14px 16px; display:grid; gap:12px; justify-items:center}
canvas{
  width: min(960px, 100%);
  height: auto;
  border-radius: 18px;
  border:1px solid var(--stroke);
  background: rgba(255,255,255,.03);
}
.help{color:var(--muted); font-size:13px; text-align:center}
