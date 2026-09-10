const APP_VERSION = "1.5.1";
const STORAGE_KEY = "telugu_family_tree_data_v31";
const FOCUS_KEY = "telugu_family_tree_focus_v31";
const OPENS_KEY = "telugu_family_tree_open_count";
const TOKEN_KEY = "telugu_family_tree_github_token";
const REPO_KEY = "telugu_family_tree_github_repo";
const IDB_NAME = "telugu_family_tree_db";
const IDB_STORE = "kv";

const MALE_ICON = `<svg viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>`;
const FEMALE_ICON = `<svg viewBox="0 0 24 24"><path d="M12 2a4.5 4.5 0 0 0-4.5 4.5c0 1.9 1.2 3.5 2.8 4.2C7 11.5 4 14.2 4 18v2h16v-2c0-3.8-3-6.5-6.3-7.3 1.6-.7 2.8-2.3 2.8-4.2A4.5 4.5 0 0 0 12 2zm0 2c1.4 0 2.5 1.1 2.5 2.5S13.4 9 12 9s-2.5-1.1-2.5-2.5S10.6 4 12 4z"/></svg>`;

const DEFAULT_FAMILY = [
  { id: "1", name: "laxman", gender: "male", dob: "1962-01-01", spouseId: "2", anniversary: "1985-05-18", parentIds: ["1788499824606", "1788499832236"] },
  { id: "2", name: "kalavathi", gender: "female", dob: "1970-01-01", spouseId: "1", anniversary: "1985-05-18", parentIds: ["1788499796499"] },
  { id: "1788499738062", name: "arjun", gender: "male", dob: "1986-01-01", spouseId: "1788499767902", anniversary: null, parentIds: ["1", "2"] },
  { id: "1788499744418", name: "arun", gender: "male", dob: "1994-01-01", spouseId: null, anniversary: null, parentIds: ["1", "2"] },
  { id: "1788499753179", name: "aravind", gender: "male", dob: "1996-01-01", spouseId: null, anniversary: null, parentIds: ["1", "2"] },
  { id: "1788499767902", name: "navya", gender: "female", dob: "1994-01-01", spouseId: "1788499738062", anniversary: null, parentIds: ["1788530252033"] },
  { id: "1788499776564", name: "veda", gender: "female", dob: "2018-01-01", spouseId: null, anniversary: null, parentIds: ["1788499738062", "1788499767902"] },
  { id: "1788499784981", name: "jr veda", gender: "female", dob: "2026-01-01", spouseId: null, anniversary: null, parentIds: ["1788499738062", "1788499767902"] },
  { id: "1788499796499", name: "lakshmi", gender: "female", dob: null, spouseId: "1788503137601", anniversary: null, parentIds: [] },
  { id: "1788499824606", name: "Narasaiah", gender: "male", dob: null, spouseId: "1788499832236", anniversary: null, parentIds: [] },
  { id: "1788499832236", name: "Ratnavva", gender: "female", dob: null, spouseId: "1788499824606", anniversary: null, parentIds: [] },
  { id: "1788499964158", name: "malliswari", gender: "female", dob: "1976-01-01", spouseId: "1788500027227", anniversary: null, parentIds: ["1788499796499"] },
  { id: "1788500027227", name: "Srinivas", gender: "male", dob: "1972-01-01", spouseId: "1788499964158", anniversary: null, parentIds: [] },
  { id: "1788501001590", name: "Geetha", gender: "female", dob: "1981-01-01", spouseId: "1788501015143", anniversary: null, parentIds: ["1788499796499"] },
  { id: "1788501015143", name: "Raju", gender: "male", dob: "1977-01-01", spouseId: "1788501001590", anniversary: null, parentIds: [] },
  { id: "1788501031856", name: "Harini", gender: "female", dob: "2016-01-01", spouseId: null, anniversary: null, parentIds: ["1788501015143", "1788501001590"] },
  { id: "1788501127880", name: "Ashok", gender: "male", dob: null, spouseId: "1788501143419", anniversary: null, parentIds: ["1788499796499"] },
  { id: "1788501143419", name: "Vasantha", gender: "female", dob: "1977-01-01", spouseId: "1788501127880", anniversary: null, parentIds: [] },
  { id: "1788501162260", name: "Sagar", gender: "male", dob: "1992-01-01", spouseId: null, anniversary: null, parentIds: ["1788501127880", "1788501143419"] },
  { id: "1788501182997", name: "Manasa", gender: "female", dob: "1994-01-01", spouseId: null, anniversary: null, parentIds: ["1788501127880", "1788501143419"] },
  { id: "1788501209163", name: "Rachana", gender: "female", dob: "1998-01-01", spouseId: null, anniversary: null, parentIds: ["1788501127880", "1788501143419"] },
  { id: "1788503137601", name: "mallaiah", gender: "male", dob: null, spouseId: "1788499796499", anniversary: null, parentIds: [] },
  { id: "1788530252033", name: "Bhumeshwar", gender: "male", dob: "1970-01-01", spouseId: "1788530281445", anniversary: null, parentIds: [] },
  { id: "1788530252133", name: "ammulu", gender: "female", dob: "2003-01-01", spouseId: null, anniversary: null, parentIds: ["1788530252033"] },
  { id: "1788530281445", name: "laxmi", gender: "female", dob: "1977-01-01", spouseId: "1788530252033", anniversary: null, parentIds: [] }
];

let family = [];
let focusPersonId = "";
let memberById = new Map();
let parentsCache = new Map();
let kinshipCache = new Map();
let childrenByParent = new Map();
let siblingIds = new Map();
let kinshipIndex = null;
let lastLayout = null;
let viewport, svg, container, nodesLayer, zoom;
let lastSavedAt = 0;
let githubSaveTimer = null;
let saveInFlight = false;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[ch]));
}

function rebuildIndexes() {
  memberById = new Map(family.map((m) => [m.id, m]));
  parentsCache = new Map();
  kinshipCache = new Map();
  kinshipIndex = null;
  childrenByParent = new Map();
  family.forEach((m) => {
    getAllParents(m).forEach((p) => {
      if (!childrenByParent.has(p.id)) childrenByParent.set(p.id, []);
      childrenByParent.get(p.id).push(m);
    });
  });
  siblingIds = new Map();
  family.forEach((m) => {
    const set = new Set();
    getAllParents(m).forEach((p) => {
      (childrenByParent.get(p.id) || []).forEach((c) => {
        if (c.id !== m.id) set.add(c.id);
      });
    });
    siblingIds.set(m.id, Array.from(set));
  });
}

function getMember(id) {
  return memberById.get(id);
}

function looksLikeMinimalFallback(arr) {
  if (!Array.isArray(arr) || arr.length !== 2) return false;
  const ids = arr.map((m) => m.id).sort().join(",");
  return ids === "1,2";
}

function cloneMembers(list) {
  return (list || []).map((m) => ({ ...m, parentIds: [...(m.parentIds || [])] }));
}

function parseRecord(raw) {
  if (!raw) return null;
  if (typeof raw === "string") {
    try { raw = JSON.parse(raw); } catch (e) { return null; }
  }
  if (Array.isArray(raw) && raw.length > 0 && !looksLikeMinimalFallback(raw)) {
    return { savedAt: 0, family: raw, focusPersonId: null, visits: [] };
  }
  if (raw && Array.isArray(raw.family) && raw.family.length > 0) {
    return {
      savedAt: Number(raw.savedAt) || 0,
      family: raw.family,
      focusPersonId: raw.focusPersonId || null,
      visits: Array.isArray(raw.visits) ? raw.visits : []
    };
  }
  return null;
}

function makeRecord() {
  return {
    savedAt: lastSavedAt || Date.now(),
    focusPersonId,
    family,
    visits: loadLocalVisits()
  };
}

function applyRecord(record) {
  family = cloneMembers(record.family);
  rebuildIndexes();
  if (record.focusPersonId && getMember(record.focusPersonId)) {
    focusPersonId = record.focusPersonId;
  }
  if (record.visits && record.visits.length) mergeRemoteVisits(record.visits);
}

function inferRepo() {
  const stored = localStorage.getItem(REPO_KEY);
  if (stored && stored.includes("/")) return stored;
  const host = location.hostname || "";
  const m = host.match(/^([^.]+)\.github\.io$/i);
  if (m) {
    const parts = location.pathname.split("/").filter(Boolean);
    return `${m[1]}/${parts[0] || (m[1] + ".github.io")}`;
  }
  return "anilsfdc3006-ctrl/family-tree";
}

function idbOpen() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) return resolve(null);
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
}

async function idbSet(key, value) {
  const db = await idbOpen();
  if (!db) return;
  await new Promise((resolve) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}

async function idbGet(key) {
  const db = await idbOpen();
  if (!db) return null;
  return new Promise((resolve) => {
    const tx = db.transaction(IDB_STORE, "readonly");
    const req = tx.objectStore(IDB_STORE).get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => resolve(null);
  });
}

function setSaveStatus(text, kind) {
  const el = document.getElementById("saveStatus");
  const short = document.getElementById("saveStatusShort");
  if (el) {
    el.textContent = text;
    el.className = "save-status" + (kind ? " " + kind : "");
  }
  if (short) short.textContent = text;
}

function persistLocalOnly() {
  lastSavedAt = Date.now();
  const record = makeRecord();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    localStorage.setItem(FOCUS_KEY, focusPersonId || "");
    setSaveStatus("Saved on this device", "ok");
  } catch (e) {
    setSaveStatus("Device storage is full — download a backup", "err");
  }
  idbSet("record", record);
}

function persistFamilyData() {
  persistLocalOnly();
  scheduleGithubSave();
}

function scheduleGithubSave() {
  if (!localStorage.getItem(TOKEN_KEY)) return;
  clearTimeout(githubSaveTimer);
  githubSaveTimer = setTimeout(() => saveToWebsite(true), 1800);
}

async function fetchRemoteRecord() {
  const repo = inferRepo();
  try {
    const api = await fetch(`https://api.github.com/repos/${repo}/contents/family_data.json?ref=main`, {
      cache: "no-store",
      headers: { Accept: "application/vnd.github+json" }
    });
    if (api.ok) {
      const json = await api.json();
      if (json.content) {
        const text = decodeURIComponent(escape(atob(String(json.content).replace(/\n/g, ""))));
        const parsed = parseRecord(text);
        if (parsed) return parsed;
      }
    }
  } catch (e) { /* public API may be rate-limited */ }
  try {
    const res = await fetch("family_data.json?t=" + Date.now(), { cache: "no-store" });
    if (res.ok) return parseRecord(await res.json());
  } catch (e) { /* offline */ }
  return null;
}

async function initializeApp() {
  if (typeof d3 === "undefined") {
    const screen = document.getElementById("loadingScreen");
    if (screen) screen.innerHTML = "<p>Could not load the tree library (d3.min.js).</p>";
    return;
  }

  setupCanvas();
  fillGithubSettingsForm();
  const ver = document.getElementById("appVersion");
  if (ver) ver.textContent = "v" + APP_VERSION;
  document.title = "Family Tree v" + APP_VERSION;

  let local = parseRecord(localStorage.getItem(STORAGE_KEY));
  if (!local) local = parseRecord(await idbGet("record"));
  const remote = await fetchRemoteRecord();

  const candidates = [local, remote].filter(Boolean);
  candidates.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0) || b.family.length - a.family.length);
  const chosen = candidates[0];

  if (chosen) {
    applyRecord(chosen);
    lastSavedAt = chosen.savedAt || Date.now();
  } else {
    family = cloneMembers(DEFAULT_FAMILY);
    rebuildIndexes();
  }

  if (!focusPersonId || !getMember(focusPersonId)) {
    const savedFocus = localStorage.getItem(FOCUS_KEY);
    const arjun = family.find((m) => m.name.toLowerCase() === "arjun");
    focusPersonId = (savedFocus && getMember(savedFocus) && savedFocus) || (arjun ? arjun.id : (family[0]?.id || "1"));
  }

  persistLocalOnly();
  if (local && remote && (local.savedAt || 0) > (remote.savedAt || 0) && localStorage.getItem(TOKEN_KEY)) {
    scheduleGithubSave();
  }

  updateHeaderInputs();
  renderTree();
  requestAnimationFrame(() => resetZoom(false));
  hideLoading();
  trackOpen();
}

function hideLoading() {
  const screen = document.getElementById("loadingScreen");
  if (screen) screen.classList.add("hidden");
}

function exportFamilyJson() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(makeRecord(), null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "family_tree_backup.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function importFamilyJson(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const record = parseRecord(e.target.result);
      if (!record) {
        alert("Invalid JSON file.");
        return;
      }
      applyRecord(record);
      if (!focusPersonId) focusPersonId = family[0].id;
      persistFamilyData();
      renderTree();
      updateHeaderInputs();
      resetZoom();
      alert(`Loaded ${family.length} relatives successfully!`);
    } catch (err) {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

function fillGithubSettingsForm() {
  const repo = document.getElementById("githubRepo");
  const token = document.getElementById("githubToken");
  if (repo) repo.value = inferRepo();
  if (token) token.value = localStorage.getItem(TOKEN_KEY) || "";
}

function toggleSettingsPanel() {
  fillGithubSettingsForm();
  document.getElementById("settingsModal").classList.toggle("hidden");
}

function saveGithubSettings() {
  const repo = (document.getElementById("githubRepo").value || "").trim();
  const token = (document.getElementById("githubToken").value || "").trim();
  if (repo) localStorage.setItem(REPO_KEY, repo);
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
  closeModal("settingsModal");
  saveToWebsite(false);
}

async function saveToWebsite(silent) {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    if (!silent) toggleSettingsPanel();
    else setSaveStatus("Saved on this device only", "warn");
    return;
  }
  if (saveInFlight) return;
  saveInFlight = true;
  setSaveStatus("Saving to website…", "warn");
  const repo = inferRepo();
  const bodyText = JSON.stringify(makeRecord(), null, 2);
  try {
    const metaRes = await fetch(`https://api.github.com/repos/${repo}/contents/family_data.json`, {
      headers: { Authorization: "Bearer " + token, Accept: "application/vnd.github+json" }
    });
    const meta = metaRes.ok ? await metaRes.json() : {};
    const putRes = await fetch(`https://api.github.com/repos/${repo}/contents/family_data.json`, {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + token,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "Update family tree data",
        content: btoa(unescape(encodeURIComponent(bodyText))),
        sha: meta.sha
      })
    });
    if (!putRes.ok) {
      const err = await putRes.json().catch(() => ({}));
      throw new Error(err.message || ("GitHub " + putRes.status));
    }
    setSaveStatus("Saved to website", "ok");
  } catch (e) {
    setSaveStatus("Website save failed — still on this device. " + (e.message || ""), "err");
    if (!silent) alert("Could not save to the website. Data is still kept on this device.\n\n" + (e.message || e));
  } finally {
    saveInFlight = false;
  }
}

function loadLocalVisits() {
  try {
    const parsed = JSON.parse(localStorage.getItem("telugu_family_tree_visits") || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveLocalVisits(list) {
  localStorage.setItem("telugu_family_tree_visits", JSON.stringify(list.slice(0, 300)));
}

function mergeRemoteVisits(remote) {
  const local = loadLocalVisits();
  const key = (v) => `${v.name}|${v.at}`;
  const map = new Map();
  [...remote, ...local].forEach((v) => {
    if (v && v.name && v.at) map.set(key(v), v);
  });
  const merged = Array.from(map.values()).sort((a, b) => b.at - a.at);
  saveLocalVisits(merged);
}

function readLocalOpens() {
  const n = parseInt(localStorage.getItem(OPENS_KEY) || "0", 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function bumpLocalOpens() {
  const already = sessionStorage.getItem("telugu_family_tree_open_bumped");
  let n = readLocalOpens();
  if (!already) {
    n += 1;
    localStorage.setItem(OPENS_KEY, String(n));
    sessionStorage.setItem("telugu_family_tree_open_bumped", "1");
  }
  return n;
}

function setOpenCount(n) {
  const el = document.getElementById("openCount");
  if (el) el.textContent = String(n);
}

async function hitRemoteCounter() {
  const urls = [
    "https://abacus.jasoncameron.dev/hit/anilsfdc-family-tree/opens",
    "https://api.counterapi.dev/v1/anilsfdc-family-tree/opens/up"
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const data = await res.json();
      const n = data.value ?? data.count ?? data.Count;
      if (typeof n === "number" && n >= 0) return n;
    } catch (e) { /* try next */ }
  }
  return null;
}

async function trackOpen() {
  const local = bumpLocalOpens();
  setOpenCount(local);
  const remote = await hitRemoteCounter();
  const total = Math.max(local, remote || 0);
  if (remote && remote > local) localStorage.setItem(OPENS_KEY, String(remote));
  setOpenCount(total);
  const sessionKey = "telugu_family_tree_checked_in";
  if (!sessionStorage.getItem(sessionKey)) {
    sessionStorage.setItem(sessionKey, "1");
    showCheckin();
  }
  renderVisitsList(total);
}

function showCheckin() {
  const box = document.getElementById("checkinBar");
  const select = document.getElementById("checkinName");
  if (!box || !select) return;
  const names = family.map((m) => m.name).sort((a, b) => a.localeCompare(b));
  select.innerHTML = `<option value="">Guest / skip</option>` + names.map((n) => `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`).join("");
  const remembered = localStorage.getItem("telugu_family_tree_who");
  if (remembered) select.value = remembered;
  box.classList.remove("hidden");
}

function submitCheckin() {
  const select = document.getElementById("checkinName");
  const typed = (document.getElementById("checkinOther")?.value || "").trim();
  const name = typed || (select && select.value) || "";
  document.getElementById("checkinBar")?.classList.add("hidden");
  if (!name) return;
  localStorage.setItem("telugu_family_tree_who", name);
  const visits = loadLocalVisits();
  visits.unshift({ name, at: Date.now() });
  saveLocalVisits(visits);
  persistLocalOnly();
  scheduleGithubSave();
  renderVisitsList();
}

function skipCheckin() {
  document.getElementById("checkinBar")?.classList.add("hidden");
}

function renderVisitsList(total) {
  const el = document.getElementById("visitsList");
  const countEl = document.getElementById("openCount");
  if (countEl && total != null) countEl.textContent = String(total);
  if (!el) return;
  const visits = loadLocalVisits();
  const byName = new Map();
  visits.forEach((v) => {
    const cur = byName.get(v.name) || { name: v.name, times: 0, last: 0 };
    cur.times += 1;
    cur.last = Math.max(cur.last, v.at);
    byName.set(v.name, cur);
  });
  const rows = Array.from(byName.values()).sort((a, b) => b.last - a.last);
  el.innerHTML = rows.length
    ? rows.map((r) => `<div class="event-item"><strong>${escapeHtml(r.name)}</strong> · ${r.times} open${r.times === 1 ? "" : "s"} · last ${new Date(r.last).toLocaleString()}</div>`).join("")
    : `<p class="muted">No named check-ins yet. Opens are still counted.</p>`;
}

function toggleVisitsPanel() {
  document.getElementById("membersDrawer").classList.add("hidden");
  document.getElementById("eventsDrawer").classList.add("hidden");
  document.getElementById("visitsDrawer").classList.toggle("hidden");
  renderVisitsList();
}

const isOlder = (p1, p2) => {
  if (!p1 || !p2 || !p1.dob || !p2.dob) return false;
  return new Date(p1.dob) < new Date(p2.dob);
};

function getAllParents(person) {
  if (!person) return [];
  if (parentsCache.has(person.id)) return parentsCache.get(person.id);
  const pSet = new Set(person.parentIds || []);
  (person.parentIds || []).forEach((pId) => {
    const parent = getMember(pId);
    if (parent && parent.spouseId) pSet.add(parent.spouseId);
  });
  const result = Array.from(pSet).map((id) => getMember(id)).filter(Boolean);
  parentsCache.set(person.id, result);
  return result;
}

const areSiblings = (p1, p2) => {
  if (!p1 || !p2 || p1.id === p2.id) return false;
  const p1Parents = getAllParents(p1).map((p) => p.id);
  const p2Parents = getAllParents(p2).map((p) => p.id);
  return p1Parents.some((id) => p2Parents.includes(id));
};

function kinshipNeighbors(person) {
  const out = [];
  getAllParents(person).forEach((p) => out.push({ to: p, type: "parent" }));
  (childrenByParent.get(person.id) || []).forEach((c) => out.push({ to: c, type: "child" }));
  (siblingIds.get(person.id) || []).forEach((id) => {
    const s = getMember(id);
    if (s) out.push({ to: s, type: "sibling" });
  });
  if (person.spouseId) {
    const sp = getMember(person.spouseId);
    if (sp) out.push({ to: sp, type: "spouse" });
  }
  return out;
}

function pathBetter(next, prev) {
  if (!prev) return true;
  if (next.dist !== prev.dist) return next.dist < prev.dist;
  if (next.affinal !== prev.affinal) return !next.affinal && prev.affinal;
  return false;
}

function buildKinshipIndex(egoId) {
  const ego = getMember(egoId);
  const index = new Map();
  if (!ego) return index;

  const start = {
    id: ego.id,
    gen: 0,
    cross: false,
    line: "E",
    affinal: false,
    minGen: 0,
    dist: 0,
    hop: null
  };
  const queue = [start];
  index.set(ego.id, start);

  for (let i = 0; i < queue.length; i++) {
    const cur = queue[i];
    const person = getMember(cur.id);
    if (!person) continue;
    const edges = kinshipNeighbors(person);
    for (const edge of edges) {
      const nxt = edge.to;
      let gen = cur.gen;
      let cross = cur.cross;
      let line = cur.line;
      let affinal = cur.affinal;
      if (edge.type === "parent") gen += 1;
      else if (edge.type === "child") gen -= 1;
      if (edge.type === "sibling" && cur.gen > 0 && person.gender !== nxt.gender) cross = !cross;
      if (edge.type === "spouse") {
        cross = !cross;
        affinal = true;
      }
      if (cur.id === ego.id && edge.type === "parent") line = nxt.gender === "male" ? "P" : "M";
      if (cur.id === ego.id && edge.type === "spouse") line = "S";
      const cell = {
        id: nxt.id,
        gen,
        cross,
        line,
        affinal,
        minGen: Math.min(cur.minGen, gen),
        dist: cur.dist + 1,
        hop: cur.id === ego.id ? edge.type : cur.hop
      };
      if (!pathBetter(cell, index.get(nxt.id))) continue;
      index.set(nxt.id, cell);
      queue.push(cell);
    }
  }
  return index;
}

function ensureKinshipIndex() {
  if (!kinshipIndex) kinshipIndex = buildKinshipIndex(focusPersonId);
}

function bioTag(cell) {
  if (!cell || cell.affinal) return "";
  if (cell.dist === 1 && (cell.hop === "parent" || cell.hop === "child" || cell.hop === "sibling" || cell.hop === "spouse")) {
    return " [సొంత]";
  }
  if (cell.dist === 2 && !cell.cross && (cell.gen === 2 || cell.gen === -2)) return " [సొంత]";
  if (cell.dist === 2 && cell.gen === 0 && !cell.cross && cell.hop === "parent") return " [సొంత]";
  return "";
}

function termGen0(ego, alter, cell) {
  const male = alter.gender === "male";
  const older = isOlder(alter, ego);
  const femaleEgo = ego.gender === "female";
  if (!cell.cross) {
    if (male) return older ? "అన్నయ్య (Annayya)" : "తమ్ముడు (Tammudu)";
    return older ? "అక్క (Akka)" : "చెల్లి (Chelli)";
  }
  if (femaleEgo) {
    if (male) return older ? "బావగారు (Bavagaru)" : "మరిది (Maridi)";
    return older ? "వదిన (Vadina)" : "ఆడబిడ్డ (Aadabidda)";
  }
  if (male) return older ? "బావ (Bava)" : "బావమరిది (Bavamariidi)";
  return older ? "వదిన (Vadina)" : "మరదలు (Maradalu)";
}

function termGenPlus1(ego, alter, cell) {
  const male = alter.gender === "male";
  const father = getAllParents(ego).find((p) => p.gender === "male");
  const mother = getAllParents(ego).find((p) => p.gender === "female");
  const vsFather = father ? isOlder(alter, father) : false;
  const vsMother = mother ? isOlder(alter, mother) : false;
  const spouse = alter.spouseId ? getMember(alter.spouseId) : null;
  const spouseVsFather = spouse && father ? isOlder(spouse, father) : vsFather;
  const spouseVsMother = spouse && mother ? isOlder(spouse, mother) : vsMother;

  if (cell.line === "S") {
    return male ? "మామగారు (Mamagaru)" : "అత్తగారు / అత్త (Atthagaru)";
  }

  if (cell.line === "P") {
    if (!cell.cross && male && !cell.affinal) return vsFather ? "పెద్దనాన్న (Peddananna)" : "బాబాయ్ (Babai)";
    if (!cell.cross && male && cell.affinal) return "మామయ్య (Mamayya)";
    if (!cell.cross && !male && !cell.affinal) return spouseVsFather ? "పెద్దమ్మ (Peddamma)" : "పిన్ని (Pinni)";
    if (!cell.cross && !male && cell.affinal) return "అత్తయ్య (Attayya)";
    if (cell.cross && !male && !cell.affinal) return "మేనత్త / అత్తయ్య (Menattha)";
    if (cell.cross && !male && cell.affinal) return spouseVsFather ? "పెద్దమ్మ (Peddamma)" : "పిన్ని (Pinni)";
    if (cell.cross && male && !cell.affinal) return "మేనమామ / మామయ్య (Menamama)";
    if (cell.cross && male && cell.affinal) return "మామయ్య (Mamayya)";
  }

  if (cell.line === "M") {
    if (!cell.cross && !male && !cell.affinal) return vsMother ? "పెద్దమ్మ (Peddamma)" : "పిన్ని (Pinni)";
    if (!cell.cross && !male && cell.affinal) return "అత్తయ్య (Attayya)";
    if (!cell.cross && male && !cell.affinal) return vsMother ? "పెద్దనాన్న (Peddananna)" : "బాబాయ్ (Babai)";
    if (!cell.cross && male && cell.affinal) return vsMother ? "పెద్దనాన్న (Peddananna)" : "బాబాయ్ (Babai)";
    if (cell.cross && male && !cell.affinal) return "మేనమామ / మామయ్య (Menamama)";
    if (cell.cross && male && cell.affinal) return "మామయ్య (Mamayya)";
    if (cell.cross && !male && !cell.affinal) return vsMother ? "పెద్దమ్మ (Peddamma)" : "మేనత్త / అత్తయ్య (Menattha)";
    if (cell.cross && !male && cell.affinal) return "అత్తయ్య (Attayya)";
  }

  if (male) return cell.cross ? "మేనమామ / మామయ్య (Menamama)" : "బాబాయ్ (Babai)";
  return cell.cross ? "మేనత్త / అత్తయ్య (Menattha)" : "పిన్ని (Pinni)";
}

function termGenMinus1(ego, alter, cell) {
  const male = alter.gender === "male";
  if (!cell.cross && !cell.affinal) return male ? "కొడుకు (Koduku)" : "కూతురు (Kooturu)";
  if (!cell.cross && cell.affinal) return male ? "కొడుకు (Koduku)" : "కూతురు (Kooturu)";
  if (cell.cross && cell.affinal) return male ? "అల్లుడు (Alludu)" : "కోడలు (Kodalu)";
  return male ? "మేనల్లుడు (Menalludu)" : "మేనకోడలు (Menakodalu)";
}

function termFromMatrix(ego, alter, cell) {
  if (!alter) return "";
  if (!cell) {
    return alter.gender === "male" ? "బాబాయ్ (Babai)" : "పిన్ని (Pinni)";
  }

  if (cell.dist === 1 && cell.hop === "spouse") {
    return alter.gender === "female" ? "భార్య (Bharya) [సొంత]" : "భర్త (Bhartha) [సొంత]";
  }
  if (cell.dist === 1 && cell.hop === "parent") {
    return alter.gender === "male"
      ? "తండ్రి / నాన్న (Tandri / Nanna) [సొంత]"
      : "తల్లి / అమ్మ (Talli / Amma) [సొంత]";
  }
  if (cell.dist === 1 && cell.hop === "child") {
    return alter.gender === "male" ? "కొడుకు (Koduku) [సొంత]" : "కూతురు (Kooturu) [సొంత]";
  }
  if (cell.dist === 1 && cell.hop === "sibling") {
    const tag = " [సొంత]";
    if (alter.gender === "male") return (isOlder(alter, ego) ? "అన్నయ్య (Annayya)" : "తమ్ముడు (Tammudu)") + tag;
    return (isOlder(alter, ego) ? "అక్క (Akka)" : "చెల్లి (Chelli)") + tag;
  }

  if (cell.minGen < 0 && cell.gen === 0) {
    return alter.gender === "male" ? "వియ్యంకుడు (Viyyankudu)" : "వియ్యపురాలు (Viyyaralu)";
  }

  const tag = bioTag(cell);
  const g = cell.gen;

  if (g >= 3) {
    if (alter.gender === "male") return "తాతయ్య (Taatayya)" + tag;
    return cell.line === "M" ? "అమ్మమ్మ (Ammamma)" + tag : "నానమ్మ (Nanamma)" + tag;
  }
  if (g === 2) {
    if (alter.gender === "male") return "తాతయ్య (Taatayya)" + tag;
    return cell.line === "M" ? "అమ్మమ్మ (Ammamma)" + tag : "నానమ్మ (Nanamma)" + tag;
  }
  if (g === 1) return termGenPlus1(ego, alter, cell);
  if (g === 0) return termGen0(ego, alter, cell) + tag;
  if (g === -1) return termGenMinus1(ego, alter, cell) + tag;
  if (g === -2) {
    if (cell.cross && cell.affinal) {
      return alter.gender === "male" ? "మనమఅల్లుడు (Manama'alludu)" : "మనమకోడలు (Manamakodalu)";
    }
    return alter.gender === "male" ? "మనవడు (Manavadu)" : "మనవరాలు (Manavaralu)";
  }
  return alter.gender === "male" ? "మునిమనవడు (Munimanavadu)" : "మునిమనవరాలు (Munimanavaralu)";
}

function computeKinship(targetId) {
  if (targetId === focusPersonId) return "You (నేను)";
  if (kinshipCache.has(targetId)) return kinshipCache.get(targetId);
  ensureKinshipIndex();
  const ego = getMember(focusPersonId);
  const alter = getMember(targetId);
  const result = termFromMatrix(ego, alter, kinshipIndex.get(targetId));
  kinshipCache.set(targetId, result);
  return result;
}

function setFocusPerson(id) {
  focusPersonId = id;
  persistFamilyData();
  renderTree();
  updateHeaderInputs();
  centerOnFocus();
}

function deleteMember(id) {
  const person = getMember(id);
  if (!person) return;
  if (!confirm(`Are you sure you want to delete ${person.name}?`)) return;

  if (person.spouseId) {
    const spouse = getMember(person.spouseId);
    if (spouse) {
      spouse.spouseId = null;
      spouse.anniversary = null;
    }
  }

  family.forEach((m) => {
    if (m.parentIds && m.parentIds.includes(id)) {
      m.parentIds = m.parentIds.filter((pId) => pId !== id);
    }
  });

  family = family.filter((m) => m.id !== id);
  rebuildIndexes();

  if (focusPersonId === id) {
    focusPersonId = family[0] ? family[0].id : "1";
  }

  persistFamilyData();
  renderTree();
  updateHeaderInputs();
}

function clearStorageAndReset() {
  if (confirm("Reset this device to the website copy? Adds made only on this phone/computer will be lost.")) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(FOCUS_KEY);
    family = [];
    initializeApp().then(() => resetZoom());
  }
}

function calculateAgeFromDob(dobStr) {
  if (!dobStr) return "";
  const birth = new Date(dobStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : 0;
}

function syncDobToAge(dobInputId, ageInputId) {
  const dobVal = document.getElementById(dobInputId).value;
  const ageInput = document.getElementById(ageInputId);
  if (!dobVal) { ageInput.value = ""; return; }
  ageInput.value = calculateAgeFromDob(dobVal);
}

function syncAgeToDob(ageInputId, dobInputId) {
  const ageVal = parseInt(document.getElementById(ageInputId).value, 10);
  const dobInput = document.getElementById(dobInputId);
  if (isNaN(ageVal) || ageVal < 0) { dobInput.value = ""; return; }
  const currentYear = new Date().getFullYear();
  dobInput.value = `${currentYear - ageVal}-01-01`;
}

function setupCanvas() {
  if (viewport) return;
  viewport = d3.select("#viewport");
  svg = d3.select("#treeCanvas");
  container = svg.append("g");
  nodesLayer = document.getElementById("nodesLayer");

  zoom = d3.zoom()
    .scaleExtent([0.12, 2.5])
    .filter((event) => {
      const t = event.target;
      if (t.closest && t.closest("button, input, select, textarea, a, label")) return false;
      return (!event.ctrlKey || event.type === "wheel") && !event.button;
    })
    .on("zoom", (e) => {
      const { x, y, k } = e.transform;
      container.attr("transform", e.transform);
      nodesLayer.style.transform = `translate(${x}px, ${y}px) scale(${k})`;
    });

  viewport.call(zoom);
}

function getRootPerson() {
  return family.find((d) =>
    (d.parentIds || []).length === 0 &&
    (!d.spouseId || d.gender === "male" || !getMember(d.spouseId))
  ) || family[0];
}

function updateHeaderInputs() {
  const root = getRootPerson();
  if (root) {
    document.getElementById("mainPersonInput").value = root.name;
    const menuInput = document.getElementById("mainPersonInputMenu");
    if (menuInput) menuInput.value = root.name;
  }
  const focus = getMember(focusPersonId) || root;
  if (focus) document.getElementById("focusStatus").innerText = focus.name;
}

function saveMainPersonName(fromMenu) {
  const sourceId = fromMenu ? "mainPersonInputMenu" : "mainPersonInput";
  const input = document.getElementById(sourceId).value.trim();
  if (!input) return;
  const root = getRootPerson();
  if (root) {
    root.name = input;
    persistFamilyData();
    renderTree();
    updateHeaderInputs();
  }
}

function buildGraphLayout(data) {
  const visited = new Set();
  const units = [];

  data.forEach((m) => {
    if (visited.has(m.id)) return;
    const spouse = m.spouseId ? data.find((x) => x.id === m.spouseId) : null;
    const primary = (spouse && m.gender === "female" && spouse.gender === "male") ? spouse : m;
    const secondary = primary === m ? spouse : m;
    const card = { id: `card_${primary.id}`, primary, secondary, children: [] };
    units.push(card);
    visited.add(primary.id);
    if (secondary) visited.add(secondary.id);
  });

  const genMap = new Map();
  function getGen(mId, visitedTrace = new Set()) {
    if (visitedTrace.has(mId)) return 0;
    visitedTrace.add(mId);
    const m = data.find((x) => x.id === mId);
    if (!m || !m.parentIds || m.parentIds.length === 0) return 0;
    return Math.max(...m.parentIds.map((p) => getGen(p, new Set(visitedTrace)))) + 1;
  }

  units.forEach((u) => {
    const g1 = getGen(u.primary.id);
    const g2 = u.secondary ? getGen(u.secondary.id) : 0;
    genMap.set(u.id, Math.max(g1, g2));
  });

  const genBuckets = new Map();
  units.forEach((u) => {
    const g = genMap.get(u.id) || 0;
    if (!genBuckets.has(g)) genBuckets.set(g, []);
    genBuckets.get(g).push(u);
  });

  const cardsWithPos = [];
  const CARD_WIDTH = 320;
  const X_GAP = 48;
  const Y_GAP = 250;

  genBuckets.forEach((cardsInGen, g) => {
    cardsInGen.sort((a, b) => a.primary.name.localeCompare(b.primary.name));
    if (cardsInGen.length > 1) {
      const focusIdx = cardsInGen.findIndex((c) =>
        c.primary.id === focusPersonId || (c.secondary && c.secondary.id === focusPersonId)
      );
      if (focusIdx > 0) {
        const [focusCard] = cardsInGen.splice(focusIdx, 1);
        cardsInGen.splice(Math.floor(cardsInGen.length / 2), 0, focusCard);
      }
    }
    const totalWidth = cardsInGen.length * CARD_WIDTH + (cardsInGen.length - 1) * X_GAP;
    const startX = -totalWidth / 2 + CARD_WIDTH / 2;
    cardsInGen.forEach((card, idx) => {
      card.x = startX + idx * (CARD_WIDTH + X_GAP);
      card.y = g * Y_GAP;
      cardsWithPos.push(card);
    });
  });

  const links = [];
  cardsWithPos.forEach((childCard) => {
    const pParents = childCard.primary.parentIds || [];
    if (pParents.length > 0) {
      const parentCard = cardsWithPos.find((c) => c.primary.id === pParents[0] || (c.secondary && c.secondary.id === pParents[0]));
      if (parentCard) {
        links.push({
          source: { x: parentCard.x, y: parentCard.y + 150 },
          target: { x: childCard.x - (childCard.secondary ? 50 : 0), y: childCard.y - 20 }
        });
      }
    }
    if (childCard.secondary) {
      const mParents = childCard.secondary.parentIds || [];
      if (mParents.length > 0) {
        const mParentCard = cardsWithPos.find((c) => c.primary.id === mParents[0] || (c.secondary && c.secondary.id === mParents[0]));
        if (mParentCard) {
          links.push({
            source: { x: mParentCard.x, y: mParentCard.y + 150 },
            target: { x: childCard.x + 50, y: childCard.y - 20 }
          });
        }
      }
    }
  });

  return { cards: cardsWithPos, links };
}

function personBlockHtml(person, isActive, isSpouse) {
  const relation = computeKinship(person.id);
  const age = calculateAgeFromDob(person.dob);
  const side = isSpouse ? "spouse" : "";
  return `
    <div class="person-block ${side} ${isActive ? "active" : ""}" data-id="${person.id}">
      ${isSpouse ? "" : `<div class="avatar ${person.gender}">${person.gender === "female" ? FEMALE_ICON : MALE_ICON}</div>`}
      <div>
        <div class="person-name">
          ${isSpouse ? `<button type="button" class="icon-action" data-del="${person.id}" title="Delete">🗑️</button>
            <button type="button" class="icon-action" data-edit="${person.id}" title="Edit">✏️</button>` : ""}
          <span>${escapeHtml(person.name)}</span>
          ${isSpouse ? "" : `<button type="button" class="icon-action" data-edit="${person.id}" title="Edit">✏️</button>
            <button type="button" class="icon-action" data-del="${person.id}" title="Delete">🗑️</button>`}
        </div>
        <p class="person-rel">${escapeHtml(relation)}</p>
        <p class="person-age">${age !== "" ? `Age: ${age}y` : (person.dob || "DOB —")}</p>
      </div>
      ${isSpouse ? `<div class="avatar ${person.gender}">${person.gender === "female" ? FEMALE_ICON : MALE_ICON}</div>` : ""}
    </div>
  `;
}

function cardHtml(d) {
  const m = d.primary;
  const spouse = d.secondary;
  const isSpouseActive = spouse && focusPersonId === spouse.id;
  const activePerson = isSpouseActive ? spouse : m;
  const isMainActive = focusPersonId === m.id || (spouse && focusPersonId === spouse.id);
  const activeAge = calculateAgeFromDob(activePerson.dob);
  const isChild = activeAge !== "" && activeAge < 18;
  const hasFather = getAllParents(activePerson).some((p) => p.gender === "male");
  const hasMother = getAllParents(activePerson).some((p) => p.gender === "female");

  return `
    <article class="person-card ${isMainActive ? "is-focus" : ""}" data-card="${m.id}" style="left:${d.x - 160}px;top:${d.y - 24}px">
      <div class="person-row">
        ${personBlockHtml(m, !isSpouseActive, false)}
        ${spouse ? personBlockHtml(spouse, isSpouseActive, true) : ""}
      </div>
      <div class="card-label">
        <span>Actions for: <strong>${escapeHtml(activePerson.name)}</strong></span>
        <span class="card-hint">${spouse ? "Tap spouse to switch" : ""}</span>
      </div>
      <div class="add-grid" data-active="${activePerson.id}">
        <button type="button" class="add-btn" data-add="father" ${hasFather ? "disabled" : ""}>+ Nanna</button>
        <button type="button" class="add-btn" data-add="mother" ${hasMother ? "disabled" : ""}>+ Amma</button>
        <button type="button" class="add-btn" data-add="spouse" ${spouse || isChild ? "style='display:none'" : ""}>+ Spouse</button>
        <button type="button" class="add-btn" data-add="child">+ Child</button>
        <button type="button" class="add-btn" data-add="brother">+ Brother</button>
        <button type="button" class="add-btn" data-add="sister">+ Sister</button>
      </div>
    </article>
  `;
}

function renderTree() {
  rebuildIndexes();
  const { cards, links } = buildGraphLayout(family);
  lastLayout = { cards, links };

  container.selectAll("*").remove();
  container.selectAll(".link")
    .data(links)
    .enter()
    .append("path")
    .attr("class", "link-line")
    .attr("d", d3.linkVertical().x((d) => d.x).y((d) => d.y));

  nodesLayer.innerHTML = cards.map(cardHtml).join("");
  bindCardEvents();
  updateEventsList();
  updateMembersList();
  updateFocusActions();
}

function bindCardEvents() {
  nodesLayer.onclick = (event) => {
    const del = event.target.closest("[data-del]");
    if (del) { event.stopPropagation(); deleteMember(del.getAttribute("data-del")); return; }
    const edit = event.target.closest("[data-edit]");
    if (edit) { event.stopPropagation(); openEditModal(edit.getAttribute("data-edit")); return; }
    const add = event.target.closest("[data-add]");
    if (add) {
      event.stopPropagation();
      const targetId = add.parentElement.getAttribute("data-active");
      openAddModal(targetId, add.getAttribute("data-add"));
      return;
    }
    const block = event.target.closest(".person-block");
    if (block) {
      const id = block.getAttribute("data-id");
      if (id && id !== focusPersonId) setFocusPerson(id);
    }
  };
}

function openEditModal(memberId) {
  const member = getMember(memberId);
  if (!member) return;
  document.getElementById("editMemberId").value = member.id;
  document.getElementById("editFullName").value = member.name;
  document.getElementById("editGender").value = member.gender || "male";
  document.getElementById("editDob").value = member.dob || "";
  document.getElementById("editAge").value = calculateAgeFromDob(member.dob);
  document.getElementById("editAnniversary").value = member.anniversary || "";
  document.getElementById("editAnniversaryGroup").classList.toggle("hidden", !member.spouseId);
  document.getElementById("editModal").classList.remove("hidden");
}

function handleEditFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("editMemberId").value;
  const member = getMember(id);
  if (!member) return;

  member.name = document.getElementById("editFullName").value.trim();
  member.gender = document.getElementById("editGender").value;
  member.dob = document.getElementById("editDob").value || null;
  const anniversary = document.getElementById("editAnniversary").value || null;
  member.anniversary = anniversary;
  if (member.spouseId) {
    const spouse = getMember(member.spouseId);
    if (spouse) spouse.anniversary = anniversary;
  }

  persistFamilyData();
  closeModal("editModal");
  renderTree();
  updateHeaderInputs();
}

function openAddModal(targetId, type) {
  document.getElementById("formTargetId").value = targetId;
  document.getElementById("formRelationType").value = type;
  document.getElementById("memberForm").reset();
  document.getElementById("formTargetId").value = targetId;
  document.getElementById("formRelationType").value = type;

  const target = getMember(targetId);
  const targetName = target ? target.name : "Member";
  const labels = {
    father: `Add Nanna (Father) for ${targetName}`,
    mother: `Add Amma (Mother) for ${targetName}`,
    child: `Add Child for ${targetName}`,
    spouse: `Add Spouse for ${targetName}`,
    brother: `Add Brother for ${targetName}`,
    sister: `Add Sister for ${targetName}`
  };

  document.getElementById("modalTitle").innerText = labels[type] || "Add Relative";
  const genderSelect = document.getElementById("formGender");
  if (type === "father" || type === "brother") genderSelect.value = "male";
  if (type === "mother" || type === "sister") genderSelect.value = "female";
  document.getElementById("anniversaryGroup").classList.toggle("hidden", type !== "spouse");
  document.getElementById("addModal").classList.remove("hidden");
  setTimeout(() => document.getElementById("formFullName").focus(), 50);
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.add("hidden");
}

function handleFormSubmit(e) {
  e.preventDefault();
  const targetId = document.getElementById("formTargetId").value;
  const type = document.getElementById("formRelationType").value;
  const name = document.getElementById("formFullName").value.trim();
  const gender = document.getElementById("formGender").value;
  const dob = document.getElementById("formDob").value;
  const anniversary = document.getElementById("formAnniversary").value;
  if (!name) return;

  const newId = String(Date.now());
  const newMember = {
    id: newId,
    name,
    gender,
    dob: dob || null,
    spouseId: null,
    anniversary: null,
    parentIds: []
  };

  const target = getMember(targetId);
  if (!target) return;

  if (type === "child") {
    newMember.parentIds = target.spouseId ? [target.id, target.spouseId] : [target.id];
  } else if (type === "spouse") {
    newMember.spouseId = targetId;
    newMember.anniversary = anniversary || null;
    target.spouseId = newId;
    target.anniversary = anniversary || null;
  } else if (type === "father" || type === "mother") {
    if (!target.parentIds) target.parentIds = [];
    const existingParent = getAllParents(target).find((p) => type === "father" ? p.gender === "female" : p.gender === "male");
    if (existingParent) {
      newMember.spouseId = existingParent.id;
      existingParent.spouseId = newId;
    }
    target.parentIds.push(newId);
  } else if (type === "brother" || type === "sister") {
    const parents = getAllParents(target);
    if (parents.length > 0) {
      newMember.parentIds = parents.map((p) => p.id);
    } else {
      const parentId = String(Date.now() - 100);
      const defaultParent = {
        id: parentId,
        name: `${target.name}'s Parents`,
        gender: "male",
        dob: null,
        spouseId: null,
        anniversary: null,
        parentIds: []
      };
      family.push(defaultParent);
      target.parentIds = [parentId];
      newMember.parentIds = [parentId];
    }
  }

  family.push(newMember);
  closeModal("addModal");
  document.getElementById("memberForm").reset();
  setFocusPerson(newId);
}

function checkUpcoming(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  const d = new Date(dateStr);
  d.setFullYear(today.getFullYear());
  const diff = (d - today) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 30;
}

function updateEventsList() {
  const list = document.getElementById("eventsList");
  const events = [];
  family.forEach((m) => {
    if (checkUpcoming(m.dob)) events.push(`🎂 <strong>${escapeHtml(m.name)}</strong>'s Birthday (${m.dob.slice(5)})`);
    if (m.anniversary && checkUpcoming(m.anniversary)) {
      const spouse = getMember(m.spouseId);
      events.push(`💍 <strong>${escapeHtml(m.name)} & ${escapeHtml(spouse ? spouse.name : "")}</strong>'s Anniversary (${m.anniversary.slice(5)})`);
    }
  });
  const unique = [...new Set(events)];
  list.innerHTML = unique.length
    ? unique.map((e) => `<div class="event-item">${e}</div>`).join("")
    : `<p class="muted">No events in next 30 days.</p>`;
}

function updateMembersList() {
  const el = document.getElementById("membersList");
  const count = document.getElementById("memberCount");
  if (count) count.textContent = String(family.length);
  if (!el) return;
  const q = (document.getElementById("memberFilter")?.value || "").trim().toLowerCase();
  const rows = family
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter((m) => !q || m.name.toLowerCase().includes(q))
    .map((m) => `
      <button type="button" class="member-row ${m.id === focusPersonId ? "active" : ""}" onclick="setFocusPerson('${m.id}')">
        <span class="avatar ${m.gender}">${m.gender === "female" ? FEMALE_ICON : MALE_ICON}</span>
        <span class="member-meta">
          <span class="member-name">${escapeHtml(m.name)}</span>
          <span class="member-rel">${escapeHtml(computeKinship(m.id))}</span>
        </span>
      </button>
    `).join("");
  el.innerHTML = rows || `<p class="muted">No members match.</p>`;
}

function updateFocusActions() {
  const box = document.getElementById("focusActions");
  if (!box) return;
  const person = getMember(focusPersonId);
  if (!person) { box.innerHTML = ""; return; }
  const age = calculateAgeFromDob(person.dob);
  const isChild = age !== "" && age < 18;
  const hasFather = getAllParents(person).some((p) => p.gender === "male");
  const hasMother = getAllParents(person).some((p) => p.gender === "female");
  const hasSpouse = Boolean(person.spouseId);
  box.innerHTML = `
    <h3>Add relative to ${escapeHtml(person.name)}</h3>
    <div class="add-grid" data-active="${person.id}">
      <button type="button" class="add-btn" ${hasFather ? "disabled" : ""} onclick="openAddModal('${person.id}', 'father')">+ Nanna</button>
      <button type="button" class="add-btn" ${hasMother ? "disabled" : ""} onclick="openAddModal('${person.id}', 'mother')">+ Amma</button>
      <button type="button" class="add-btn" ${hasSpouse || isChild ? "disabled" : ""} onclick="openAddModal('${person.id}', 'spouse')">+ Spouse</button>
      <button type="button" class="add-btn" onclick="openAddModal('${person.id}', 'child')">+ Child</button>
      <button type="button" class="add-btn" onclick="openAddModal('${person.id}', 'brother')">+ Brother</button>
      <button type="button" class="add-btn" onclick="openAddModal('${person.id}', 'sister')">+ Sister</button>
    </div>
  `;
}

let searchTimer = null;
function handleSearch(term) {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    const q = term.trim().toLowerCase();
    if (!q) return;
    const found = family.find((f) => f.name.toLowerCase().includes(q));
    if (found && found.id !== focusPersonId) setFocusPerson(found.id);
  }, 120);
}

function centerOnFocus(animate = true) {
  if (!lastLayout || !viewport) return;
  const card = lastLayout.cards.find((c) =>
    c.primary.id === focusPersonId || (c.secondary && c.secondary.id === focusPersonId)
  );
  if (!card) return;
  const w = window.innerWidth || 800;
  const isMobile = w < 768;
  const current = d3.zoomTransform(viewport.node());
  const scale = current.k || (isMobile ? 0.55 : 0.75);
  const headerH = isMobile ? 130 : 100;
  const x = w / 2 - card.x * scale;
  const y = headerH + 90 - card.y * scale;
  const t = d3.zoomIdentity.translate(x, y).scale(scale);
  if (animate) viewport.transition().duration(320).call(zoom.transform, t);
  else viewport.call(zoom.transform, t);
}

function resetZoom(animate = true) {
  if (!viewport || !lastLayout) return;
  const w = window.innerWidth || 800;
  const isMobile = w < 768;
  const scale = isMobile ? 0.5 : 0.72;
  const card = lastLayout.cards.find((c) =>
    c.primary.id === focusPersonId || (c.secondary && c.secondary.id === focusPersonId)
  ) || lastLayout.cards[0];
  const headerH = isMobile ? 130 : 100;
  const x = w / 2 - (card ? card.x * scale : 0);
  const y = headerH + 80 - (card ? card.y * scale : 0);
  const t = d3.zoomIdentity.translate(x, y).scale(scale);
  if (animate) viewport.transition().duration(400).call(zoom.transform, t);
  else viewport.call(zoom.transform, t);
}

function toggleEventsPanel() {
  document.getElementById("membersDrawer").classList.add("hidden");
  document.getElementById("visitsDrawer")?.classList.add("hidden");
  document.getElementById("eventsDrawer").classList.toggle("hidden");
}

function toggleMembersPanel() {
  document.getElementById("eventsDrawer").classList.add("hidden");
  document.getElementById("visitsDrawer")?.classList.add("hidden");
  document.getElementById("membersDrawer").classList.toggle("hidden");
  updateMembersList();
  updateFocusActions();
}

function toggleHeaderMenu() {
  document.getElementById("headerMenu").classList.toggle("hidden");
}

function printFamilyTree() {
  const focus = getMember(focusPersonId);
  ensureKinshipIndex();
  const byGen = new Map();
  family.forEach((m) => {
    const g = m.id === focusPersonId ? 0 : (kinshipIndex.get(m.id)?.gen ?? 0);
    if (!byGen.has(g)) byGen.set(g, []);
    byGen.get(g).push(m);
  });
  const genLabel = (g) => {
    if (g >= 2) return "Grandparents and above";
    if (g === 1) return "Parents / uncles / aunts";
    if (g === 0) return "Your generation";
    if (g === -1) return "Children / nieces / nephews";
    return "Grandchildren and below";
  };
  const gens = Array.from(byGen.keys()).sort((a, b) => b - a);
  const sections = gens.map((g) => {
    const rows = byGen.get(g)
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((m) => {
        const rel = m.id === focusPersonId ? "You" : computeKinship(m.id);
        const age = calculateAgeFromDob(m.dob);
        return `<tr>
          <td>${escapeHtml(m.name)}</td>
          <td>${m.gender === "male" ? "Male" : "Female"}</td>
          <td>${age !== "" ? age : "—"}</td>
          <td>${escapeHtml(rel)}</td>
        </tr>`;
      }).join("");
    return `<h2>${genLabel(g)}</h2>
      <table>
        <thead><tr><th>Name</th><th>Gender</th><th>Age</th><th>Relation to ${escapeHtml(focus ? focus.name : "")}</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }).join("");

  const sheet = document.getElementById("printSheet");
  sheet.hidden = false;
  sheet.innerHTML = `
    <h1>Family Tree</h1>
    <p class="print-meta">v${APP_VERSION} · Printed ${new Date().toLocaleString()} · ${family.length} people · Viewing as <strong>${escapeHtml(focus ? focus.name : "")}</strong></p>
    ${sections}
  `;
  document.getElementById("headerMenu")?.classList.add("hidden");
  window.print();
}

window.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});

window.addEventListener("beforeunload", () => {
  if (family.length) persistLocalOnly();
});

window.addEventListener("afterprint", () => {
  const sheet = document.getElementById("printSheet");
  if (sheet) {
    sheet.hidden = true;
    sheet.innerHTML = "";
  }
});
