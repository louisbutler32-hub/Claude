// The front door: your name and face, open a table, join one by code, or sit at a public one.
import { $, esc, EMOJIS } from "./util.js";
import { S, profile, saveProfile } from "./state.js";
import { send, getSession, setSession } from "./net.js";
import { unlock, sfx } from "./sound.js";
import { pickFace } from "./account.js";

$("name-input").value = profile.name;
function renderFaces() {
  $("faces").innerHTML = EMOJIS.map((e) => `<button type="button" role="radio" aria-checked="${e === profile.emoji}" aria-label="${e}">${e}</button>`).join("");
}
renderFaces();
$("faces").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  profile.emoji = b.textContent; saveProfile(); renderFaces(); sfx.click();
  pickFace(profile.emoji);
});
$("name-input").addEventListener("input", () => { profile.name = $("name-input").value.trim(); saveProfile(); });

export const refreshFaces = renderFaces;
function needName() {
  if (S.account || profile.name) return false;
  $("home-error").textContent = "Pop your name in first.";
  $("name-input").focus();
  return true;
}

export function join(code) {
  if (needName()) return;
  unlock();
  const s = getSession();
  if (s && s.code === code) return send({ t: "rejoin", ...s, ...profile });
  setSession(null);
  send({ t: "join", code, ...profile });
}

$("create-btn").onclick = () => {
  if (needName()) return;
  unlock();
  setSession(null);
  send({ t: "create", ...profile });
};
$("join-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const code = $("code-input").value.trim().toUpperCase();
  if (!/^[A-Z]{4}$/.test(code)) { $("home-error").textContent = "Table codes are four letters."; return; }
  join(code);
});
$("code-input").addEventListener("input", (e) => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z]/g, ""); });
$("tables").addEventListener("click", (e) => { const b = e.target.closest("button[data-code]"); if (b) join(b.dataset.code); });

export function showError(msg) { $("home-error").textContent = msg; }

async function loadTables() {
  if (S.room) return;
  try {
    const { tables } = await (await fetch("/api/tables")).json();
    $("tables").innerHTML = tables.length
      ? tables.map((t) => `<li><span class="who">${esc(t.host)}'s table${t.playing ? " · eating" : ""}</span><span class="n">${t.players}/${t.seats}</span><button class="btn small" data-code="${t.code}">sit</button></li>`).join("")
      : `<li class="muted">No public tables right now. Open one and set it to public.</li>`;
  } catch {
    $("tables").innerHTML = `<li class="muted">Couldn't load open tables.</li>`;
  }
}
export function startTableList() { loadTables(); setInterval(loadTables, 6000); }

// a shared link looks like /?t=ABCD
export function readLinkCode() {
  const code = (new URLSearchParams(location.search).get("t") || "").toUpperCase();
  if (!/^[A-Z]{4}$/.test(code)) return null;
  $("code-input").value = code;
  return code;
}
