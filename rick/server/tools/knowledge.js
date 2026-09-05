"use strict";
const fs = require("fs");
const path = require("path");

function safeJoin(root, rel) {
  const p = path.normalize(path.join(root, rel));
  if (!p.startsWith(root)) throw new Error("Path escapes knowledge folder");
  return p;
}

function listFiles(root) {
  if (!fs.existsSync(root)) return [];
  const out = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (/\.(md|txt|json|csv)$/i.test(e.name)) {
        const st = fs.statSync(full);
        out.push({ file: path.relative(root, full).replace(/\\/g, "/"), bytes: st.size, modified: st.mtime.toISOString() });
      }
    }
  })(root);
  return out;
}

function readFile(root, rel) {
  const p = safeJoin(root, rel);
  if (!fs.existsSync(p)) throw new Error(`No such file: ${rel}`);
  return fs.readFileSync(p, "utf8").slice(0, 40000);
}

function search(root, query) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const hits = [];
  for (const f of listFiles(root)) {
    const text = fs.readFileSync(path.join(root, f.file), "utf8");
    const lines = text.split(/\r?\n/);
    lines.forEach((line, i) => {
      const l = line.toLowerCase();
      if (terms.some((t) => l.includes(t))) {
        hits.push({ file: f.file, line: i + 1, text: line.trim().slice(0, 200) });
      }
    });
  }
  return hits.slice(0, 40);
}

function readDashboard(root, file) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, "..", file), "utf8"));
  } catch {
    return null;
  }
}

module.exports = { listFiles, readFile, search, readDashboard };
