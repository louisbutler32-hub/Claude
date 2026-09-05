"use strict";
const fs = require("fs");

function load(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return { facts: [] };
  }
}
function save(file, mem) {
  fs.mkdirSync(require("path").dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(mem, null, 2));
}
function remember(file, fact) {
  const mem = load(file);
  if (!mem.facts.includes(fact)) mem.facts.push(fact);
  save(file, mem);
  return mem.facts.length;
}
function forget(file, needle) {
  const mem = load(file);
  const before = mem.facts.length;
  mem.facts = mem.facts.filter((f) => !f.toLowerCase().includes(needle.toLowerCase()));
  save(file, mem);
  return before - mem.facts.length;
}

module.exports = { load, remember, forget };
