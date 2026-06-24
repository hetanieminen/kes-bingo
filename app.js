// ====================== Kesäbingo ======================

const palette = ["#2ec4b6", "#ff6b6b", "#ffb703", "#4ec3e0", "#9b5de5", "#f15bb5", "#00bbf9", "#ff8c42"];

let sb = null;
let me = null;            // oma nimi
let viewing = null;       // kenen lappua katsotaan
let tasks = [];           // [{position, text}]
let players = [];         // ["Nimi", ...]
let completions = [];     // [{player_name, task_position, image_url, caption}]
let activeTask = null;    // muokattava ruutu

// ---------- Käynnistys ----------
function init() {
  if (typeof CONFIG === "undefined" || CONFIG.SUPABASE_URL.includes("TÄHÄN") || CONFIG.SUPABASE_ANON_KEY.includes("TÄHÄN")) {
    document.getElementById("setupWarning").hidden = false;
    document.getElementById("loginOverlay").hidden = true;
    return;
  }
  sb = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

  bindEvents();
  showLogin();
}

// Näytä kirjautumisvalikko: olemassa olevat pelaajat + "Uusi pelaaja"
async function showLogin() {
  document.getElementById("loginOverlay").hidden = false;
  document.getElementById("newPlayerArea").hidden = true;
  document.getElementById("loginErr").textContent = "";

  const choices = document.getElementById("playerChoices");
  choices.innerHTML = `<p class="hint">Ladataan pelaajia…</p>`;

  const { data } = await sb.from("players").select("name").order("created_at");
  const names = (data || []).map(x => x.name);

  // Viimeksi käytetty nimi ensimmäiseksi
  const last = localStorage.getItem("bingoNimi");
  if (last && names.includes(last)) {
    names.splice(names.indexOf(last), 1);
    names.unshift(last);
  }

  choices.innerHTML = names.map(n =>
    `<button class="choice" data-name="${escapeAttr(n)}">👤 ${escapeHtml(n)}${n === last ? " ⭐" : ""}</button>`
  ).join("");

  choices.querySelectorAll(".choice[data-name]").forEach(btn => {
    btn.onclick = () => selectPlayer(btn.dataset.name);
  });

  document.getElementById("newPlayerBtn").hidden = false;
}

// Valitse olemassa oleva pelaaja
function selectPlayer(name) {
  me = name;
  localStorage.setItem("bingoNimi", me);
  afterLogin();
}

function bindEvents() {
  document.getElementById("loginBtn").onclick = doLogin;
  document.getElementById("nameInput").addEventListener("keydown", e => { if (e.key === "Enter") doLogin(); });
  document.getElementById("changeName").onclick = () => {
    document.getElementById("app").hidden = true;
    document.getElementById("who").hidden = true;
    showLogin();
  };

  document.getElementById("taskClose").onclick = closeTaskModal;
  document.getElementById("saveTask").onclick = saveCompletion;
  document.getElementById("removeTask").onclick = removeCompletion;
  document.getElementById("fileInput").onchange = handleFile;

  document.getElementById("newPlayerBtn").onclick = () => {
    document.getElementById("newPlayerArea").hidden = false;
    document.getElementById("newPlayerBtn").hidden = true;
    document.getElementById("nameInput").focus();
  };

  document.getElementById("lightboxClose").onclick = () => document.getElementById("lightbox").hidden = true;
  document.getElementById("lightbox").onclick = e => { if (e.target.id === "lightbox") document.getElementById("lightbox").hidden = true; };

  document.getElementById("editTasksBtn").onclick = openEditModal;
  document.getElementById("editClose").onclick = () => document.getElementById("editOverlay").hidden = true;
  document.getElementById("saveTasks").onclick = saveTasks;
}

// ---------- Kirjautuminen ----------
async function doLogin() {
  const val = document.getElementById("nameInput").value.trim();
  const err = document.getElementById("loginErr");
  if (val.length < 2) { err.textContent = "Kirjoita nimesi (väh. 2 merkkiä)."; return; }

  err.textContent = "";
  const { error } = await sb.from("players").upsert({ name: val }, { onConflict: "name" });
  if (error) { err.textContent = "Virhe: " + error.message; return; }

  me = val;
  localStorage.setItem("bingoNimi", me);
  afterLogin();
}

async function afterLogin() {
  document.getElementById("loginOverlay").hidden = true;
  document.getElementById("app").hidden = false;
  document.getElementById("who").hidden = false;
  document.getElementById("whoName").textContent = "👤 " + me;
  viewing = me;
  await loadAll();
}

// ---------- Datan lataus ----------
async function loadAll() {
  const [t, p, c] = await Promise.all([
    sb.from("tasks").select("*").order("position"),
    sb.from("players").select("name").order("created_at"),
    sb.from("completions").select("*"),
  ]);
  tasks = t.data || [];
  players = (p.data || []).map(x => x.name);
  completions = c.data || [];

  if (!players.includes(me)) players.unshift(me);
  if (!players.includes(viewing)) viewing = me;

  render();
}

function completionsOf(name) {
  return completions.filter(c => c.player_name === name);
}
function getCompletion(name, pos) {
  return completions.find(c => c.player_name === name && c.task_position === pos);
}

// ---------- Renderöinti ----------
function render() {
  renderLeaderboard();
  renderTabs();
  renderGrid();
}

function renderLeaderboard() {
  const el = document.getElementById("leaderboard");
  const ranked = players
    .map(n => ({ name: n, count: completionsOf(n).length }))
    .sort((a, b) => b.count - a.count);
  const max = Math.max(tasks.length, 1);

  el.innerHTML = ranked.map((r, i) => {
    const color = palette[players.indexOf(r.name) % palette.length];
    const medal = ["🥇", "🥈", "🥉"][i] || "";
    return `<div class="lb-item">
      <span class="lb-rank">${medal || (i + 1) + "."}</span>
      <div class="lb-meta">
        <span>${escapeHtml(r.name)}${r.name === me ? " (sinä)" : ""}</span>
        <span class="lb-count">${r.count} / ${tasks.length}</span>
        <div class="lb-bar" style="width:${40 + (r.count / max) * 80}px;background:${color}"></div>
      </div>
    </div>`;
  }).join("");
}

function renderTabs() {
  const el = document.getElementById("playerTabs");
  el.innerHTML = players.map(n => {
    const cnt = completionsOf(n).length;
    return `<button class="ptab ${n === viewing ? "active" : ""}" data-name="${escapeAttr(n)}">
      ${escapeHtml(n)}${n === me ? " (sinä)" : ""} <span class="cnt">${cnt}</span>
    </button>`;
  }).join("");
  el.querySelectorAll(".ptab").forEach(btn => {
    btn.onclick = () => { viewing = btn.dataset.name; render(); };
  });

  const lbl = document.getElementById("viewingLabel");
  lbl.textContent = viewing === me ? "📋 Oma lappusi — napauta ruutua merkitäksesi suorituksen" : `👀 Katsot: ${viewing}`;
}

function renderGrid() {
  const grid = document.getElementById("grid");
  const cols = Math.ceil(Math.sqrt(tasks.length || 1));
  grid.style.setProperty("--cols", cols);
  const isMine = viewing === me;

  grid.innerHTML = tasks.map(t => {
    const c = getCompletion(viewing, t.position);
    const done = !!c;
    let inner = `<span class="celltext">${escapeHtml(t.text)}</span>`;
    if (done) {
      const img = c.image_url ? `<img class="bgimg" src="${escapeAttr(c.image_url)}" alt="">` : "";
      const zoom = (!isMine && c.image_url) ? `<span class="zoom">🔍</span>` : "";
      inner = `${img}<span class="check">✓</span>${zoom}<span class="celltext">${escapeHtml(t.text)}</span>`;
    }
    const clickable = isMine || done;
    return `<div class="cell ${done ? "done" : ""} ${clickable ? "clickable" : ""}" data-pos="${t.position}">${inner}</div>`;
  }).join("");

  grid.querySelectorAll(".cell").forEach(cell => {
    const pos = parseInt(cell.dataset.pos, 10);
    if (isMine) {
      cell.onclick = () => openTaskModal(pos);
    } else if (getCompletion(viewing, pos)) {
      cell.onclick = () => openLightbox(viewing, pos);
    }
  });
}

// ---------- Kuvan suurennus ----------
function openLightbox(name, pos) {
  const c = getCompletion(name, pos);
  if (!c) return;
  const task = tasks.find(t => t.position === pos);
  const img = document.getElementById("lightboxImg");
  if (c.image_url) {
    img.src = c.image_url;
    img.style.display = "block";
  } else {
    img.removeAttribute("src");
    img.style.display = "none";
  }
  document.getElementById("lightboxName").textContent = "👤 " + name;
  document.getElementById("lightboxTask").textContent = task ? task.text : "";
  const cap = document.getElementById("lightboxCaption");
  cap.textContent = c.caption || "";
  cap.style.display = c.caption ? "block" : "none";
  document.getElementById("lightbox").hidden = false;
}

// ---------- Suoritusmodaali ----------
let pendingImageUrl = null;

function openTaskModal(pos) {
  const task = tasks.find(t => t.position === pos);
  if (!task) return;
  const existing = getCompletion(me, pos);
  activeTask = pos;
  pendingImageUrl = existing?.image_url || null;

  document.getElementById("taskTitle").textContent = task.text;
  document.getElementById("captionInput").value = existing?.caption || "";
  document.getElementById("taskErr").textContent = "";
  document.getElementById("fileInput").value = "";
  setPreview(pendingImageUrl);
  document.getElementById("removeTask").hidden = !existing;
  document.getElementById("saveTask").textContent = existing ? "Tallenna muutokset" : "Merkitse suoritetuksi";
  document.getElementById("taskOverlay").hidden = false;
}

function closeTaskModal() {
  document.getElementById("taskOverlay").hidden = true;
  activeTask = null;
}

function setPreview(url) {
  const el = document.getElementById("imgPreview");
  el.innerHTML = url ? `<img src="${escapeAttr(url)}" alt="">` : "Ei kuvaa vielä";
}

async function handleFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const up = document.getElementById("uploading");
  const err = document.getElementById("taskErr");
  up.hidden = false;
  err.textContent = "";
  try {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const safeName = me.replace(/[^a-z0-9]/gi, "_");
    const path = `${safeName}/${activeTask}-${stamp()}.${ext}`;
    const { error } = await sb.storage.from(CONFIG.BUCKET).upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = sb.storage.from(CONFIG.BUCKET).getPublicUrl(path);
    pendingImageUrl = data.publicUrl;
    setPreview(pendingImageUrl);
  } catch (e2) {
    err.textContent = "Kuvan lataus epäonnistui: " + (e2.message || e2);
  } finally {
    up.hidden = true;
  }
}

async function saveCompletion() {
  const err = document.getElementById("taskErr");
  err.textContent = "";
  const caption = document.getElementById("captionInput").value.trim();
  const row = {
    player_name: me,
    task_position: activeTask,
    image_url: pendingImageUrl,
    caption: caption || null,
  };
  const { error } = await sb.from("completions").upsert(row, { onConflict: "player_name,task_position" });
  if (error) { err.textContent = "Virhe: " + error.message; return; }
  closeTaskModal();
  await loadAll();
}

async function removeCompletion() {
  if (!confirm("Poistetaanko tämä suoritus?")) return;
  const { error } = await sb.from("completions")
    .delete()
    .eq("player_name", me)
    .eq("task_position", activeTask);
  if (error) { document.getElementById("taskErr").textContent = "Virhe: " + error.message; return; }
  closeTaskModal();
  await loadAll();
}

// ---------- Tehtävien muokkaus ----------
function openEditModal() {
  document.getElementById("tasksText").value = tasks.map(t => t.text).join("\n");
  document.getElementById("editErr").textContent = "";
  document.getElementById("editOverlay").hidden = false;
}

async function saveTasks() {
  const err = document.getElementById("editErr");
  const lines = document.getElementById("tasksText").value
    .split("\n").map(s => s.trim()).filter(Boolean);
  if (lines.length < 1) { err.textContent = "Lisää vähintään yksi tehtävä."; return; }
  if (!confirm("Tallennetaanko tehtävät kaikille? Tämä muuttaa yhteistä ruudukkoa.")) return;

  err.textContent = "Tallennetaan…";
  // Korvaa tehtävät: poista ylimääräiset ja upsertaa uudet
  const newRows = lines.map((text, i) => ({ position: i, text }));
  const { error: upErr } = await sb.from("tasks").upsert(newRows, { onConflict: "position" });
  if (upErr) { err.textContent = "Virhe: " + upErr.message; return; }
  // Poista positiot, joita ei enää ole
  if (tasks.length > lines.length) {
    const toDelete = tasks.filter(t => t.position >= lines.length).map(t => t.position);
    await sb.from("tasks").delete().in("position", toDelete);
  }
  document.getElementById("editOverlay").hidden = true;
  await loadAll();
}

// ---------- Apurit ----------
function stamp() {
  // ei Date.now() -riippuvuutta kriittisesti, mutta yksilöivä polku
  return Math.floor(performance.now()) + "" + Math.floor(Math.random() * 1000);
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}
function escapeAttr(s) { return escapeHtml(s); }

init();
