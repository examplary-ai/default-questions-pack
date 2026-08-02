#!/usr/bin/env node
// Generates a stylised preview.png for every question type in the repo.
//
// For each directory containing a question-type.yml, this script:
//   1. starts `exp preview` (port 5777) with that directory as cwd
//   2. seeds the preview UI's localStorage with the sample payload from the
//      directory's preview.yml (question + answer)
//   3. restyles the page (hides the sidebar, gradient backdrop, icon header)
//   4. screenshots the question card with headless Chrome at 2x
//   5. writes preview.png next to question-type.yml
//
// Usage: node .github/scripts/generate-previews.mjs [type-dir ...]
//   (no arguments = all question types)

import { spawn } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import puppeteer from "puppeteer-core";
import { parse as parseYaml } from "yaml";

const ROOT = resolve(import.meta.dirname, "..", "..");
const PORT = 5777;
const BASE_URL = `http://localhost:${PORT}`;

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
].filter(Boolean);

const chromePath = CHROME_CANDIDATES.find((p) => existsSync(p));
if (!chromePath) {
  console.error(
    "🚫 No Chrome/Chromium found. Set CHROME_PATH to a browser executable.",
  );
  process.exit(1);
}

// `exp preview` calls open() on startup; shadow the `open`/`xdg-open` binaries
// with a no-op so headless runs don't spawn browser tabs.
const shimDir = mkdtempSync(join(tmpdir(), "open-shim-"));
for (const bin of ["open", "xdg-open"]) {
  writeFileSync(join(shimDir, bin), "#!/bin/sh\nexit 0\n");
  chmodSync(join(shimDir, bin), 0o755);
}
const serverEnv = { ...process.env, PATH: `${shimDir}:${process.env.PATH}` };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const isServerUp = async () => {
  try {
    const res = await fetch(BASE_URL, { signal: AbortSignal.timeout(1000) });
    return res.ok;
  } catch {
    return false;
  }
};

const waitFor = async (condition, timeoutMs, what) => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await condition()) return;
    await sleep(250);
  }
  throw new Error(`Timed out waiting for ${what}`);
};

const startServer = async (dir) => {
  const child = spawn("npx", ["exp", "preview"], {
    cwd: dir,
    env: serverEnv,
    detached: true,
    stdio: "ignore",
  });
  await waitFor(isServerUp, 30_000, `preview server for ${dir}`);
  return child;
};

const stopServer = async (child) => {
  try {
    process.kill(-child.pid, "SIGTERM");
  } catch {
    // already gone
  }
  await waitFor(async () => !(await isServerUp()), 10_000, "server shutdown");
};

const readQuestionTypeMeta = (dir) => {
  const raw = readFileSync(join(dir, "question-type.yml"), "utf8");
  const meta = parseYaml(raw);
  return {
    id: meta.id,
    name: meta.name?.en ?? meta.id,
    icon: meta.icon,
    components: Object.keys(meta.components ?? {}),
  };
};

const readPreviewSample = (dir) => {
  const path = join(dir, "preview.yml");
  if (!existsSync(path)) return { question: {}, answer: {} };
  const sample = parseYaml(readFileSync(path, "utf8"));
  return { question: sample?.question ?? {}, answer: sample?.answer ?? {} };
};

const capture = async (browser, typeDir, meta, sample) => {
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 1400, height: 1000, deviceScaleFactor: 2 });

    // Seed the preview UI's localStorage (use-local-storage stores JSON).
    const componentName = meta.components.includes("assessment")
      ? "assessment"
      : meta.components[0];
    const question = {
      id: "q_preview",
      type: meta.id,
      title: sample.question.title ?? meta.name,
      description: sample.question.description ?? "",
      settings: sample.question.settings ?? {},
    };
    await page.evaluateOnNewDocument(
      (id, entries) => {
        for (const [key, value] of Object.entries(entries)) {
          localStorage.setItem(`${key}-${id}`, JSON.stringify(value));
        }
      },
      meta.id,
      {
        "component-name": componentName,
        "payload-question": question,
        "payload-answer": sample.answer,
      },
    );

    await page.goto(BASE_URL, { waitUntil: "networkidle0", timeout: 60_000 });
    await page.waitForSelector("#root aside", { timeout: 30_000 });

    // Give the dynamically imported component (and math fonts, images, …)
    // a moment to settle, then freeze animations.
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        Array.from(document.images)
          .filter((img) => !img.complete)
          .map((img) => new Promise((r) => ((img.onload = r), (img.onerror = r)))),
      );
    });
    await sleep(2000);
    await page.addStyleTag({
      content:
        "*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }",
    });

    // Strip the preview chrome down to just the question card and return its
    // bounds. Backgrounds are made transparent so the PNG can be styled freely
    // on the website.
    const clip = await page.evaluate(() => {
      document.querySelector("#root aside")?.remove();
      document.documentElement.style.background = "transparent";
      document.body.style.background = "transparent";
      const shell = document.querySelector("#root > div");
      shell.style.cssText = "height:auto;min-height:0;display:block;";
      const column = shell.querySelector(":scope > div");
      column.style.cssText = "height:auto;display:block;overflow:visible;";
      const inner = column.querySelector(":scope > div");
      inner.style.cssText = "max-width:none;width:840px;margin:0;padding:0;";

      // Un-stretch the preview wrapper so the card hugs its content.
      const wrapper = inner.querySelector(":scope > div");
      if (wrapper) wrapper.style.minHeight = "0";
      const card = wrapper?.querySelector(":scope > div") ?? wrapper ?? inner;
      card.style.borderRadius = "0";
      card.style.borderWidth = "0";
      card.style.boxShadow = "none";
      card.style.backgroundColor = "white";

      const rect = card.getBoundingClientRect();
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      };
    });

    await sleep(300);
    await page.screenshot({
      path: join(typeDir, "preview.png"),
      clip,
      captureBeyondViewport: true,
      omitBackground: true,
    });
  } finally {
    await page.close();
  }
};

const main = async () => {
  const requested = process.argv.slice(2).map((d) => d.replace(/\/$/, ""));
  const allTypes = readdirSync(ROOT).filter((entry) =>
    existsSync(join(ROOT, entry, "question-type.yml")),
  );
  const types = requested.length
    ? requested.filter((t) => {
        if (!allTypes.includes(t)) console.warn(`⚠️ Skipping unknown type ${t}`);
        return allTypes.includes(t);
      })
    : allTypes;

  if (await isServerUp()) {
    console.error(
      `🚫 Something is already running on port ${PORT} — stop it first.`,
    );
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: process.env.CI ? ["--no-sandbox", "--disable-setuid-sandbox"] : [],
  });

  const failures = [];
  try {
    for (const type of types) {
      const typeDir = join(ROOT, type);
      process.stdout.write(`📸 ${type} ... `);
      let server;
      try {
        const meta = readQuestionTypeMeta(typeDir);
        const sample = readPreviewSample(typeDir);
        server = await startServer(typeDir);
        await capture(browser, typeDir, meta, sample);
        console.log("done");
      } catch (error) {
        failures.push(type);
        console.log(`failed: ${error.message}`);
      } finally {
        if (server) await stopServer(server);
      }
    }
  } finally {
    await browser.close();
  }

  if (failures.length) {
    console.error(`\n🚫 Failed: ${failures.join(", ")}`);
    process.exit(1);
  }
  console.log(`\n✅ Generated previews for ${types.length} question types`);
};

await main();
