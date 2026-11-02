// End-to-end check: three phones join one table and play a full game.
// Needs Playwright with Chromium installed. Run: npm test
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const { chromium } = require("playwright");

const PORT = 3999;
const BASE = `http://localhost:${PORT}`;
const OUT = process.env.SHOTS || path.join(__dirname, "..", "test-shots");
const root = path.join(__dirname, "..");

// answers by prompt, straight from the data files
const byPrompt = {};
for (const f of fs.readdirSync(path.join(root, "data")).filter((f) => f.endsWith(".json"))) {
  const c = JSON.parse(fs.readFileSync(path.join(root, "data", f), "utf8"));
  byPrompt[c.prompt] = c.answers.map((a) => a[0]);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function check(cond, msg) { if (!cond) throw new Error("FAILED: " + msg); console.log("  ok  " + msg); }

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const server = spawn(process.execPath, ["server.js"], { cwd: root, env: { ...process.env, PORT: String(PORT) }, stdio: ["ignore", "pipe", "pipe"] });
  server.stdout.on("data", (d) => process.stdout.write("  [server] " + d));
  server.stderr.on("data", (d) => process.stdout.write("  [server!] " + d));
  await sleep(1200);

  const browser = await chromium.launch();
  const errors = [];
  const phone = async (name) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => errors.push(`${name}: ${e.message}`));
    page.on("console", (m) => { if (m.type() === "error") errors.push(`${name}: ${m.text()}`); });
    page.name = name;
    return page;
  };
  try {
    const [a, b, c] = [await phone("Ana"), await phone("Ben"), await phone("Cat")];

    await a.goto(BASE);
    await a.screenshot({ path: path.join(OUT, "1-home.png"), fullPage: true });
    await a.fill("#name-input", "Ana");
    await a.click("#create-btn");
    await a.waitForSelector("#scr-lobby:not([hidden])");
    const code = (await a.textContent("#room-code")).trim();
    check(/^[A-Z]{4}$/.test(code), `table opened with code ${code}`);

    for (const [p, n] of [[b, "Ben"], [c, "Cat"]]) {
      await p.goto(`${BASE}/?t=${code}`);
      check((await p.inputValue("#code-input")) === code, `${n}'s invite link pre-fills the code`);
      await p.fill("#name-input", n);
      await p.click("#join-form button");
      await p.waitForSelector("#scr-lobby:not([hidden])");
    }
    await a.waitForFunction(() => document.querySelectorAll("#lobby-players li").length === 3);
    check(true, "host sees all three players");
    check(await b.isHidden("#host-panel"), "guests don't get host controls");

    await a.click('#hearts-seg button[data-h="1"]');
    await a.waitForFunction(() => document.querySelector('#hearts-seg button[data-h="1"]').getAttribute("aria-pressed") === "true");
    await a.screenshot({ path: path.join(OUT, "2-lobby-host.png"), fullPage: true });
    await a.click("#start-btn");
    for (const p of [a, b, c]) await p.waitForSelector("#scr-game:not([hidden])");
    check(true, "everyone is in the game");

    const holderPage = async () => {
      for (const p of [a, b, c]) if (await p.isVisible("#answer-form")) return p;
      return null;
    };
    const promptOf = async (p) => (await p.textContent("#prompt")).replace(/^\S+\s/, "").trim();

    // pass the plate a few times with real answers
    let used = [];
    for (let turn = 0; turn < 4; turn++) {
      let h = null;
      for (let i = 0; i < 20 && !h; i++) { h = await holderPage(); if (!h) await sleep(150); }
      if (!h) break; // plate may have burned already
      const list = byPrompt[await promptOf(h)];
      check(!!list, `prompt "${await promptOf(h)}" has answer data`);
      if (turn === 1 && used.length) {
        await h.fill("#answer-input", used[0]);
        await h.press("#answer-input", "Enter");
        await h.waitForFunction(() => /already served/.test(document.querySelector("#flash").textContent), null, { timeout: 3000 });
        check(true, `${h.name} is told "${used[0]}" was already served`);
        await sleep(250);
        await h.fill("#answer-input", "qqqq zzzz xxyy");
        await h.press("#answer-input", "Enter");
        await h.waitForFunction(() => /isn't on the menu/.test(document.querySelector("#flash").textContent), null, { timeout: 3000 });
        check(true, `${h.name} gets "not on the menu" for nonsense`);
      }
      const ans = list[turn * 7 + 3];
      const others = [a, b, c].filter((p) => p !== h);
      await h.type("#answer-input", ans.slice(0, 4), { delay: 20 });
      await others[0].waitForFunction((t) => document.querySelector("#bubble").textContent.startsWith(t), ans.slice(0, 4), { timeout: 3000 });
      check(true, `${others[0].name} sees ${h.name} typing live`);
      await h.fill("#answer-input", ans);
      await h.press("#answer-input", "Enter");
      await h.waitForFunction(() => document.querySelector("#answer-form").hidden, null, { timeout: 3000 });
      check(true, `${h.name} passed the plate with "${ans}"`);
      used.push(ans);
      if (turn === 0) await others[0].screenshot({ path: path.join(OUT, "3-game-watching.png"), fullPage: true });
    }
    const h2 = await holderPage();
    if (h2) await h2.screenshot({ path: path.join(OUT, "4-game-your-turn.png"), fullPage: true });

    // nobody answers: the plate must burn (fuse is 14-38s)
    await a.waitForFunction(() => !document.querySelector("#burn").hidden || !document.querySelector("#scr-over").hidden, null, { timeout: 45000 });
    check(true, "the plate burned on someone");
    await a.screenshot({ path: path.join(OUT, "5-burned.png"), fullPage: true });

    // with one heart each, two burns end the game
    await a.waitForSelector("#scr-over:not([hidden])", { timeout: 70000 });
    const title = await a.textContent("#over-title");
    check(/wins/.test(title), `game over: "${title}"`);
    await a.screenshot({ path: path.join(OUT, "6-over.png"), fullPage: true });

    await a.click("#again-btn");
    await a.waitForSelector("#scr-game:not([hidden])");
    check(true, "host can start a rematch");

    // refresh mid-game: the player comes back to the same seat
    await b.reload();
    await b.waitForSelector("#scr-game:not([hidden])", { timeout: 8000 });
    check(true, "a refreshed phone rejoins the game");

    check(errors.length === 0, "no errors in any browser" + (errors.length ? ": " + errors.join(" | ") : ""));
    console.log("\nAll checks passed. Screenshots in " + OUT);
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.kill();
  }
})();
