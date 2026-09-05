"use strict";
const os = require("os");
const { exec, spawn } = require("child_process");

// ---- CPU sampling (works on Windows, unlike os.loadavg) ----
let last = cpuSnapshot();
let cpuPercent = 0;
function cpuSnapshot() {
  let idle = 0, total = 0;
  for (const c of os.cpus()) {
    for (const k in c.times) total += c.times[k];
    idle += c.times.idle;
  }
  return { idle, total };
}
setInterval(() => {
  const now = cpuSnapshot();
  const dIdle = now.idle - last.idle;
  const dTotal = now.total - last.total;
  cpuPercent = dTotal > 0 ? Math.round((1 - dIdle / dTotal) * 100) : 0;
  last = now;
}, 2000).unref();

function stats() {
  const total = os.totalmem();
  const free = os.freemem();
  return {
    hostname: os.hostname(),
    platform: `${os.type()} ${os.release()}`,
    cpu: { model: os.cpus()[0]?.model?.trim() || "cpu", cores: os.cpus().length, percent: cpuPercent },
    memory: {
      totalGb: +(total / 1e9).toFixed(1),
      usedGb: +((total - free) / 1e9).toFixed(1),
      percent: Math.round(((total - free) / total) * 100),
    },
    uptimeSeconds: Math.round(os.uptime()),
    time: new Date().toISOString(),
  };
}

function humanUptime(s) {
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

// ---- Opening apps / URLs (cross-platform, Windows first) ----
function openTarget(target) {
  return new Promise((resolve) => {
    const isUrl = /^https?:\/\//i.test(target);
    let cmd;
    if (process.platform === "win32") {
      // `start` needs an empty title argument when the target is quoted
      cmd = `start "" "${target}"`;
    } else if (process.platform === "darwin") {
      cmd = isUrl ? `open "${target}"` : `open -a "${target}"`;
    } else {
      cmd = isUrl ? `xdg-open "${target}"` : `${target} &`;
    }
    exec(cmd, { windowsHide: true, timeout: 8000 }, (err) => {
      if (err) resolve({ ok: false, error: err.message });
      else resolve({ ok: true, launched: target });
    });
  });
}

function runShell(command, timeoutMs = 15000) {
  return new Promise((resolve) => {
    exec(command, { windowsHide: true, timeout: timeoutMs, maxBuffer: 1024 * 256 }, (err, stdout, stderr) => {
      resolve({
        ok: !err,
        exitCode: err ? err.code : 0,
        stdout: String(stdout || "").slice(0, 6000),
        stderr: String(stderr || "").slice(0, 2000),
      });
    });
  });
}

module.exports = { stats, humanUptime, openTarget, runShell, spawn };
