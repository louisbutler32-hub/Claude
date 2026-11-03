// The WebSocket to the server: reconnects on its own, and rejoins the same seat after a
// refresh or a dropped connection using the id + token the server handed out.
import { store } from "./util.js";

const handlers = {};
let ws = null, retry = 0, queue = [];
let session = store.get("hp-session"); // { code, id, token }  (your seat at a table)
let accountToken = store.get("hp-account"); // your saved profile, if you signed in
let profile = () => ({});

export const on = (type, fn) => ((handlers[type] = handlers[type] || []).push(fn));
const emit = (type, msg) => (handlers[type] || []).forEach((fn) => fn(msg));

export function send(msg) {
  if (ws && ws.readyState === 1) ws.send(JSON.stringify(msg));
  else queue.push(msg);
}

export const getSession = () => session;
export function setSession(s) {
  session = s;
  if (s) store.set("hp-session", s); else store.del("hp-session");
}

export const getAccountToken = () => accountToken;
export function setAccountToken(t) {
  accountToken = t;
  if (t) store.set("hp-account", t); else store.del("hp-account");
}

export function connect(getProfile) {
  profile = getProfile;
  ws = new WebSocket((location.protocol === "https:" ? "wss://" : "ws://") + location.host + "/ws");
  ws.onopen = () => {
    retry = 0;
    // sign back in first, so a rejoined seat is linked to the profile
    if (accountToken) ws.send(JSON.stringify({ t: "auth", token: accountToken }));
    if (session) ws.send(JSON.stringify({ t: "rejoin", ...session, ...profile() }));
    const q = queue; queue = [];
    q.forEach(send);
    emit("open");
  };
  ws.onmessage = (e) => {
    let m;
    try { m = JSON.parse(e.data); } catch { return; }
    emit(m.t, m);
  };
  ws.onclose = () => {
    ws = null;
    emit("close");
    setTimeout(() => connect(profile), Math.min(8000, 500 * 2 ** retry++));
  };
}
