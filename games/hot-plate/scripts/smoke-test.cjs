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
const phase = (p) => p.getAttribute("#app", "data-phase");
const waitPhase = (p, ph, timeout = 8000) => p.waitForSelector(`#app[data-phase="${ph}"]`, { timeout });

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const server = spawn(process.execPath, ["server.js"], { cwd: root, env: { ...process.env, PORT: String(PORT) }, stdio: ["ignore", "pipe", "pipe"] });
  server.stdout.on("data", (d) => process.stdout.write("  [server] " + d));
  server.stderr.on("data", (d) => process.stdout.write("  [server!] " + d));
  await sleep(1200);

  const browser = await chromium.launch();
  const errors = [];
  const device = async (name, viewport) => {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => errors.push(`${name}: ${e.message}`));
    page.on("console", (m) => { if (m.type() === "error") errors.push(`${name}: ${m.text()}`); });
    page.name = name;
    return page;
  };
  try {
    const a = await device("Ana", { width: 1280, height: 800 });   // laptop
    const b = await device("Ben", { width: 390, height: 844 });    // phones
    const c = await device("Cat", { width: 390, height: 844 });

    await a.goto(BASE);
    await sleep(400);
    await a.screenshot({ path: path.join(OUT, "1-home.png") });
    await a.fill("#name-input", "Ana");
    await a.click("#create-btn");
    await waitPhase(a, "lobby");
    const code = (await a.textContent("#big-code")).trim();
    check(/^[A-Z]{4}$/.test(code), `table opened with code ${code}`);

    for (const [p, n] of [[b, "Ben"], [c, "Cat"]]) {
      await p.goto(`${BASE}/?t=${code}`);
      check((await p.inputValue("#code-input")) === code, `${n}'s invite link pre-fills the code`);
      await p.fill("#name-input", n);
      await p.click("#join-form button");
      await waitPhase(p, "lobby");
    }
    await a.waitForFunction(() => document.querySelectorAll(".seat:not(.empty)").length === 3);
    check(true, "host sees three players seated round the table");
    check(/I'm ready/.test(await b.textContent("#big-btn")), "guests get a ready button");
    await b.click("#big-btn");
    await a.waitForFunction(() => /2 ready/.test(document.querySelector("#ready-info").textContent));
    check(true, "Ben's ready shows up for the host");

    await c.fill("#chat-input", "hello table");
    await c.press("#chat-input", "Enter");
    await a.waitForFunction(() => /hello table/.test(document.querySelector("#chat-log").textContent));
    check(true, "chat reaches the host");

    await a.click("#settings-btn");
    await a.click('.stepper[data-k="hearts"] button[data-d="-1"]');
    await a.waitForFunction(() => document.querySelector('.stepper[data-k="hearts"] .v').textContent.trim() === "1");
    check(true, "host turned hearts down to 1");
    await a.screenshot({ path: path.join(OUT, "2-settings.png") });
    await a.click("#settings-modal [data-close]");
    await a.screenshot({ path: path.join(OUT, "3-lobby-host.png") });
    await b.screenshot({ path: path.join(OUT, "3-lobby-phone.png") });

    await a.click("#big-btn");
    for (const p of [a, b, c]) await waitPhase(p, "play");
    check(true, "everyone is in the game");

    const holderPage = async () => {
      for (const p of [a, b, c]) if (await p.isVisible("#answer-form")) return p;
      return null;
    };
    const promptOf = async (p) => (await p.textContent("#marquee-title")).replace(/^\S+\s/, "").trim();

    let used = [];
    for (let turn = 0; turn < 4; turn++) {
      let h = null;
      for (let i = 0; i < 20 && !h; i++) { h = await holderPage(); if (!h) await sleep(150); }
      if (!h) break;
      const list = byPrompt[await promptOf(h)];
      check(!!list, `prompt "${await promptOf(h)}" has answer data`);
      if (turn === 1 && used.length) {
        await h.fill("#answer-input", used[0]);
        await h.press("#answer-input", "Enter");
        await h.waitForFunction(() => /already served/.test(document.querySelector("#flash").textContent), null, { timeout: 3000 });
        check(true, `${h.name} is told "${used[0]}" was already served`);
        await sleep(250);
        const others = [a, b, c].filter((p) => p !== h);
        await h.fill("#answer-input", "qqqq zzzz xxyy");
        await h.press("#answer-input", "Enter");
        await h.waitForFunction(() => /isn't on the menu/.test(document.querySelector("#flash").textContent), null, { timeout: 3000 });
        check(true, `${h.name} gets "not on the menu" for nonsense`);
        await others[0].waitForSelector(".bubble.nope", { timeout: 2000 });
        check(true, `${others[0].name} sees the wrong guess crossed out`);
      }
      const ans = list[turn * 7 + 3];
      const others = [a, b, c].filter((p) => p !== h);
      await h.type("#answer-input", ans.slice(0, 4), { delay: 20 });
      await others[0].waitForFunction((t) => { const el = document.querySelector(".bubble.typing"); return el && el.textContent.startsWith(t); }, ans.slice(0, 4).trim(), { timeout: 3000 })
        .catch(async (e) => { console.log("  debug: typed", JSON.stringify(ans.slice(0, 4)), "holder input", JSON.stringify(await h.inputValue("#answer-input")), "bubbles:", await others[0].evaluate(() => [...document.querySelectorAll(".bubble")].map((b) => b.className + ":" + b.textContent).join(" | "))); throw e; });
      check(true, `${others[0].name} sees ${h.name} typing in their bubble`);
      if (turn === 0) { await a.screenshot({ path: path.join(OUT, "4-typing-laptop.png") }); await b.screenshot({ path: path.join(OUT, "4-typing-phone.png") }); }
      await h.fill("#answer-input", ans);
      await h.press("#answer-input", "Enter");
      await h.waitForFunction(() => document.querySelector("#answer-form").hidden, null, { timeout: 3000 });
      await others[0].waitForFunction((t) => [...document.querySelectorAll(".bubble")].some((el) => el.textContent.startsWith(t)), ans, { timeout: 3000 });
      check(true, `${h.name} served "${ans}" and it shows on their plate`);
      used.push(ans);
    }
    const secs = await a.textContent("#secs");
    check(/\d+\.\ds/.test(secs), `the clock is counting down (${secs})`);
    await a.screenshot({ path: path.join(OUT, "5-game-laptop.png") });
    const h2 = await holderPage();
    if (h2) await h2.screenshot({ path: path.join(OUT, "5-game-your-turn.png") });

    // nobody answers: the clock runs out and someone gets burned
    await a.waitForSelector('#app[data-phase="break"], #app[data-phase="over"]', { timeout: 20000 });
    check(true, "the clock ran out and someone got burned");
    await a.screenshot({ path: path.join(OUT, "6-burned.png") });

    await waitPhase(a, "over", 45000);
    const title = await a.textContent("#over-title");
    check(/wins/.test(title), `game over: "${title}"`);
    await a.screenshot({ path: path.join(OUT, "7-over.png") });
    await b.screenshot({ path: path.join(OUT, "7-over-phone.png") });

    await a.click("#again-btn");
    await waitPhase(a, "play");
    check(true, "host can start another round");

    await b.reload();
    await waitPhase(b, "play", 8000);
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
