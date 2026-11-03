// The latest room state from the server, plus small questions about it.
import { store, EMOJIS } from "./util.js";

export const S = { room: null, prev: null, clockOffset: 0, cats: [], account: null };

export const profile = store.get("hp-profile") || { name: "", emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)] };
export const saveProfile = () => store.set("hp-profile", profile);

export function setRoom(room) {
  S.prev = S.room;
  S.room = room;
  if (room) S.clockOffset = room.now - Date.now();
}

export const now = () => Date.now() + S.clockOffset;
export const me = () => S.room && S.room.players.find((p) => p.id === S.room.you);
export const byId = (id) => S.room && S.room.players.find((p) => p.id === id);
export const isHost = () => !!S.room && S.room.hostId === S.room.you;

// home | lobby | play | break | over
export function phase() {
  if (!S.room) return "home";
  return S.room.phase === "playing" ? "play" : S.room.phase;
}

// who sits at the table, rotated so that you are always in the seat nearest the screen
export function seating() {
  const r = S.room;
  if (!r) return { players: [], count: 6 };
  let players = r.players.filter((p) => p.connected || p.alive || p.score || p.served);
  const mine = players.findIndex((p) => p.id === r.you);
  if (mine > 0) players = [...players.slice(mine), ...players.slice(0, mine)];
  const count = r.phase === "lobby" ? Math.max(r.settings.seats, players.length) : Math.max(2, players.length);
  return { players, count };
}
