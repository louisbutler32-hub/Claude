"use strict";
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const ROOT = path.join(__dirname, "..");

function loadConfig() {
  const file = path.join(ROOT, "rick.config.json");
  const cfg = JSON.parse(fs.readFileSync(file, "utf8"));
  cfg.model = process.env.RICK_MODEL || cfg.model || "claude-opus-5";
  cfg.port = Number(process.env.RICK_PORT || cfg.port || 7777);
  cfg.paths = {
    root: ROOT,
    knowledge: path.join(ROOT, "knowledge"),
    data: path.join(ROOT, "data"),
    memory: path.join(ROOT, "data", "memory.json"),
    public: path.join(ROOT, "public"),
  };
  return cfg;
}

module.exports = { loadConfig, ROOT };
