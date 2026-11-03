// Side panel (room code + chat), the menu, and the settings / categories / how-to modals.
import { $, esc, toast } from "./util.js";
import { S, isHost } from "./state.js";
import { send } from "./net.js";
import { isMuted, toggleMute, sfx } from "./sound.js";

/* ---------- room code + chat ---------- */

let seenChat = 0, chatOpen = false;
export function renderPanel() {
  const r = S.room;
  $("side").hidden = !r;
  $("chat-toggle").hidden = !r;
  if (!r) return;
  $("side-code").textContent = r.code;
  $("side-link").textContent = location.host + "/?t=" + r.code;
  const log = $("chat-log");
  const atBottom = log.scrollHeight - log.scrollTop - log.clientHeight < 40;
  log.innerHTML = r.chat.map((c) => c.kind === "sys"
    ? `<li class="sys">${esc(c.text)}</li>`
    : `<li><b>${esc(c.emoji)} ${esc(c.name)}</b> ${esc(c.text)}</li>`).join("");
  if (atBottom || r.chat.length !== seenChat) log.scrollTop = log.scrollHeight;
  const last = r.chat[r.chat.length - 1];
  if (r.chat.length > seenChat && seenChat && last && last.kind === "chat" && last.id !== r.you) {
    sfx.chat();
    if (!chatOpen) $("chat-toggle").classList.add("unread");
  }
  seenChat = r.chat.length;
}
$("chat-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const v = $("chat-input").value.trim();
  if (!v) return;
  send({ t: "chat", text: v });
  $("chat-input").value = "";
});
// the panel opens and closes from the 💬 button (a column on wide screens, a drawer on phones)
function setChat(open) {
  chatOpen = open;
  document.body.classList.toggle("chat-closed", !open);
  $("chat-toggle").classList.remove("unread");
  if (open) $("chat-log").scrollTop = $("chat-log").scrollHeight;
  window.dispatchEvent(new Event("hp-layout")); // the table can use the space
}
$("chat-toggle").onclick = () => setChat(!chatOpen);
$("side-close").onclick = () => setChat(false);
chatOpen = matchMedia("(min-width: 1100px)").matches;
document.body.classList.toggle("chat-closed", !chatOpen);

/* ---------- invite ---------- */

export async function invite() {
  if (!S.room) return;
  const link = location.origin + "/?t=" + S.room.code;
  if (navigator.share && matchMedia("(pointer: coarse)").matches) {
    try { await navigator.share({ title: "Hot Plate", text: `Pull up a chair: table ${S.room.code}`, url: link }); return; } catch {}
  }
  try { await navigator.clipboard.writeText(link); toast("Invite link copied"); }
  catch { toast("Send friends: " + link); }
}
$("invite-btn").onclick = invite;
$("side-link").onclick = invite;

/* ---------- menu ---------- */

function paintMute() { $("sound-btn").textContent = isMuted() ? "🔇" : "🔊"; $("sound-btn").setAttribute("aria-label", isMuted() ? "Sound off" : "Sound on"); }
$("sound-btn").onclick = () => { toggleMute(); paintMute(); };
paintMute();
$("menu-btn").onclick = () => { $("menu").hidden = !$("menu").hidden; };
document.addEventListener("click", (e) => { if (!e.target.closest("#menu, #menu-btn")) $("menu").hidden = true; });
$("leave-btn").onclick = () => { if (S.room) send({ t: "leave" }); };
$("menu").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-open]");
  if (b) { $("menu").hidden = true; open(b.dataset.open); }
});

/* ---------- modals ---------- */

export function open(id) {
  if (id === "settings-modal") renderSettings();
  if (id === "cats-modal") renderCats();
  $(id).hidden = false;
}
document.querySelectorAll(".modal").forEach((m) => m.addEventListener("click", (e) => {
  if (e.target === m || e.target.closest("[data-close]")) m.hidden = true;
}));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") document.querySelectorAll(".modal").forEach((m) => (m.hidden = true)); });
$("how-btn").onclick = () => open("how-modal");
$("settings-btn").onclick = () => open("settings-modal");
$("cats-open").onclick = () => open("cats-modal");

export function refreshModals() {
  if (!$("settings-modal").hidden) renderSettings();
  if (!$("cats-modal").hidden) renderCats();
}

/* ---------- settings ---------- */

const STEPS = [
  { k: "hearts", label: "lives", vals: [1, 2, 3, 4, 5] },
  { k: "turn", label: "turn time", vals: Array.from({ length: 16 }, (_, i) => i + 5), fmt: (v) => v + "s" },
  { k: "seats", label: "seats", vals: Array.from({ length: 11 }, (_, i) => i + 2) },
  { k: "heartCap", label: "heart cap", vals: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
  { k: "perHeart", label: "points / heart", vals: [0, 300, 400, 500, 600, 800, 1000, 1500, 2000], fmt: (v) => (v || "off") },
  { k: "public", label: "room", vals: [false, true], fmt: (v) => (v ? "public" : "private"), loop: true },
];

function renderSettings() {
  const r = S.room;
  if (!r) return;
  const host = isHost() && r.phase !== "playing" && r.phase !== "break";
  $("steppers").innerHTML = STEPS.map((s) => {
    const v = r.settings[s.k], i = s.vals.indexOf(v);
    const off = (d) => !host || (!s.loop && (d < 0 ? i <= 0 : i >= s.vals.length - 1));
    return `<div class="stepper" data-k="${s.k}"><span class="k">${s.label}</span>
      <button data-d="-1" aria-label="Less ${s.label}" ${off(-1) ? "disabled" : ""}>◀</button>
      <span class="v">${s.fmt ? s.fmt(v) : v}</span>
      <button data-d="1" aria-label="More ${s.label}" ${off(1) ? "disabled" : ""}>▶</button></div>`;
  }).join("");
  const n = r.settings.cats.length;
  $("cats-summary").textContent = S.cats.length && n === S.cats.length ? "everything" : `${n} picked`;
  $("settings-note").textContent = host
    ? "Each pass takes half a second off the next turn, down to 4s. Points / heart: pass that many points and you win a life back, up to the cap."
    : "Only the host can change these.";
}
$("steppers").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-d]");
  if (!b || !isHost()) return;
  const s = STEPS.find((x) => x.k === b.closest(".stepper").dataset.k);
  const i = s.vals.indexOf(S.room.settings[s.k]), d = Number(b.dataset.d);
  const n = s.loop ? (i + d + s.vals.length) % s.vals.length : Math.max(0, Math.min(s.vals.length - 1, i + d));
  send({ t: "settings", [s.k]: s.vals[n] });
});

/* ---------- categories ---------- */

fetch("/api/categories").then((r) => r.json()).then((d) => { S.cats = d.categories; }).catch(() => {});

function renderCats() {
  const r = S.room;
  if (!r) return;
  const host = isHost();
  const sel = new Set(r.settings.cats);
  const total = S.cats.filter((c) => sel.has(c.id)).reduce((n, c) => n + c.size, 0);
  $("cats-title").textContent = `menu · ${sel.size} categories · ${total.toLocaleString()} answers`;
  const groups = {};
  S.cats.forEach((c) => (groups[c.group] = groups[c.group] || []).push(c));
  $("cat-groups").innerHTML = Object.entries(groups).map(([g, list]) => `
    <div class="cat-group"><h3>${esc(g)}</h3><div class="cat-list">
      ${list.map((c) => `<button class="cat-chip" data-id="${c.id}" aria-pressed="${sel.has(c.id)}" ${host ? "" : "disabled"}>${c.emoji} ${esc(c.prompt.replace(/^Name (any |an? )?/i, ""))} <small>${c.size.toLocaleString()}</small></button>`).join("")}
    </div></div>`).join("");
  $("cats-all").hidden = $("cats-rand").hidden = !host;
}
$("cat-groups").addEventListener("click", (e) => {
  const b = e.target.closest(".cat-chip");
  if (!b || !isHost()) return;
  const sel = new Set(S.room.settings.cats);
  if (sel.has(b.dataset.id)) { if (sel.size === 1) return toast("Keep at least one category."); sel.delete(b.dataset.id); }
  else sel.add(b.dataset.id);
  send({ t: "settings", cats: [...sel] });
});
$("cats-all").onclick = () => send({ t: "settings", cats: S.cats.map((c) => c.id) });
$("cats-rand").onclick = () => send({ t: "settings", cats: S.cats.map((c) => c.id).sort(() => Math.random() - 0.5).slice(0, 6) });
