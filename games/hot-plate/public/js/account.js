// Profiles: sign in or create one with a name and PIN, see your stats and streaks, sign out.
import { $, esc, TIERS } from "./util.js";
import { S, profile, saveProfile } from "./state.js";
import { send, on, getAccountToken, setAccountToken } from "./net.js";
import { open } from "./panels.js";

let mode = "in"; // in | new
const tz = () => new Date().getTimezoneOffset();

function setMode(m) {
  mode = m;
  $("auth-tab-in").setAttribute("aria-selected", m === "in");
  $("auth-tab-new").setAttribute("aria-selected", m === "new");
  $("auth-submit").textContent = m === "in" ? "sign in" : "create my profile";
  $("auth-pin").setAttribute("autocomplete", m === "in" ? "current-password" : "new-password");
  $("auth-error").textContent = "";
}
$("auth-tab-in").onclick = () => setMode("in");
$("auth-tab-new").onclick = () => setMode("new");

$("auth-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("auth-name").value.trim(), pin = $("auth-pin").value.trim();
  if (!name) return ($("auth-error").textContent = "Type your name.");
  if (!/^\d{4,6}$/.test(pin)) return ($("auth-error").textContent = "Your PIN is 4 to 6 digits.");
  $("auth-error").textContent = "";
  send({ t: mode === "in" ? "login" : "signup", name, pin, emoji: profile.emoji, tz: tz() });
});

on("auth-error", (m) => { $("auth-error").textContent = m.msg; });
on("auth-failed", () => { setAccountToken(null); S.account = null; renderAccount(); });
on("account", (m) => {
  if (m.token) setAccountToken(m.token);
  if (!m.profile) setAccountToken(null);
  S.account = m.profile;
  if (m.profile) {
    profile.name = m.profile.name;
    if (m.profile.emoji) profile.emoji = m.profile.emoji;
    saveProfile();
    $("auth-modal").hidden = true;
    $("auth-pin").value = "";
  }
  renderAccount();
  if (!$("profile-modal").hidden) renderProfile();
});

$("signout-btn").onclick = () => {
  send({ t: "logout", token: getAccountToken() });
  setAccountToken(null);
  S.account = null;
  $("profile-modal").hidden = true;
  renderAccount();
};

export function renderAccount() {
  const a = S.account;
  document.body.classList.toggle("is-signed-in", !!a);
  $("guest-name").hidden = !!a;
  if (a) {
    const s = a.stats;
    $("account-box").innerHTML = `
      <div class="who"><span class="face">${a.emoji || "🍽️"}</span><div><b>${esc(a.name)}</b><span>${s.games} games · ${s.wins} wins · ${s.points.toLocaleString()} pts</span></div></div>
      <div class="streak-row">${streakChip("🔥", s.dayStreak, "day streak")}${streakChip("👑", s.winStreak, "wins in a row")}</div>
      <button class="link" id="open-profile">your profile</button>`;
    $("open-profile").onclick = () => { renderProfile(); open("profile-modal"); };
  } else {
    $("account-box").innerHTML = `<p class="pitch">Playing as a guest. <button class="link" id="open-auth">Sign in or create a profile</button> to keep your points and streaks.</p>`;
    $("open-auth").onclick = () => { $("auth-name").value = profile.name || ""; setMode("in"); open("auth-modal"); };
  }
}

const streakChip = (icon, n, label) => `<span class="streak ${n ? "" : "cold"}">${icon} <b>${n}</b> ${label}</span>`;

export function renderProfile() {
  const a = S.account;
  if (!a) return;
  const s = a.stats;
  $("profile-head").innerHTML = `<span class="face big">${a.emoji || "🍽️"}</span><div><h2>${esc(a.name)}</h2><p>since you sat down: ${s.games} game${s.games === 1 ? "" : "s"}</p></div>`;
  $("profile-streaks").innerHTML = `
    <div class="streak-card"><span>🔥</span><b>${s.dayStreak}</b><small>day streak<br>best ${s.bestDayStreak}</small></div>
    <div class="streak-card"><span>👑</span><b>${s.winStreak}</b><small>wins in a row<br>best ${s.bestWinStreak}</small></div>
    <div class="streak-card"><span>🌶️</span><b>${s.bestHotStreak}</b><small>best spicy streak<br>in one game</small></div>`;
  const rate = s.games ? Math.round((s.wins / s.games) * 100) : 0;
  const rows = [
    ["wins", `${s.wins} <small>(${rate}%)</small>`],
    ["points", s.points.toLocaleString()],
    ["best game", `${s.best} pts`],
    ["answers served", s.served.toLocaleString()],
    ["rarest find", s.bestFind ? `${esc(s.bestFind.name)} <small>${TIERS[s.bestFind.tier].name.toLowerCase()}</small>` : "none yet"],
  ];
  $("profile-stats").innerHTML = rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("");
}

// open() renders modals it knows about; profile is ours
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-open='profile-modal']");
  if (b) renderProfile();
});
export const pickFace = (emoji) => { if (S.account) send({ t: "face", emoji }); };
