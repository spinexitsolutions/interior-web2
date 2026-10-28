#!/usr/bin/env node
// Records a vertical 1080x1920 Instagram reel of the public website (never the admin).
//
//   npm run reel                    phone layout, saves reel/aangan-reel.mp4
//   npm run reel -- --url=https://your-site.com   record a live site instead of starting one
//   npm run reel -- --fps=60        smoother (takes twice as long)
//
// The page clock is faked and advanced one frame at a time, so every animation lands on an
// exact 30/60 fps frame no matter how slow the machine is.

import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? "true"];
  }),
);
const FPS = Number(args.fps || 30);
const FRAME = 1000 / FPS;
const PORT = 3123;
const BASE = (args.url || `http://localhost:${PORT}`).replace(/\/$/, "");
const OUT_DIR = path.join(root, "reel");
const FRAMES = path.join(OUT_DIR, "frames");
const OUT = path.join(OUT_DIR, args.out || "aangan-reel.mp4");

/* ------------------------------------------------------------------ server */

let server;
async function up(url) {
  try {
    const r = await fetch(url);
    return r.ok;
  } catch {
    return false;
  }
}
async function startServer() {
  if (args.url) return;
  if (await up(BASE)) return;
  console.log("Starting the website on port", PORT, "...");
  server = spawn(process.execPath, [path.join(root, "node_modules/next/dist/bin/next"), "dev", "-p", String(PORT)], {
    cwd: root,
    stdio: "ignore",
  });
  for (let i = 0; i < 120; i++) {
    if (await up(BASE)) return;
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("The website did not start. Try `npm run dev` on its own to see the error.");
}
async function warmUp(paths) {
  // Compile every route we will visit so nothing stalls mid-recording.
  for (const p of paths) await fetch(BASE + p).catch(() => {});
}

/* ------------------------------------------------------------------ recorder */

let page;
let frame = 0;

async function shot() {
  const file = path.join(FRAMES, `${String(frame++).padStart(5, "0")}.jpg`);
  await page.screenshot({ path: file, type: "jpeg", quality: 92 });
}
async function tick() {
  await page.clock.runFor(FRAME);
  await shot();
}
async function hold(ms) {
  for (let t = 0; t < ms; t += FRAME) await tick();
}
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Scroll by `dy` pixels over `ms`, as a person flicking a trackpad would (Lenis smooths it). */
async function scrollBy(dy, ms) {
  const n = Math.max(1, Math.round(ms / FRAME));
  let done = 0;
  for (let i = 1; i <= n; i++) {
    const target = Math.round(dy * easeInOut(i / n));
    await page.mouse.wheel(0, target - done);
    done = target;
    await tick();
  }
}
/** Let smooth scrolling come to rest before measuring anything (adds a natural pause). */
async function settle(maxMs = 1500) {
  let last = -1;
  let still = 0;
  for (let t = 0; t < maxMs && still < 3; t += FRAME) {
    await tick();
    const y = await page.evaluate(() => window.scrollY);
    still = Math.abs(y - last) < 0.5 ? still + 1 : 0;
    last = y;
  }
}
async function scrollToEl(selector, ms, offset = 0.15) {
  await settle();
  const dy = await page.evaluate(
    ([s, o]) => {
      const el = document.querySelector(s);
      if (!el) return 0;
      return el.getBoundingClientRect().top - window.innerHeight * o;
    },
    [selector, offset],
  );
  await scrollBy(dy, ms);
}
async function tickUntilUrl(re, maxMs = 6000) {
  for (let t = 0; t < maxMs && !re.test(page.url()); t += FRAME) await tick();
}
async function tapIfVisible(selector, index = 0) {
  const el = page.locator(selector).nth(index);
  if (await el.count()) {
    await el.click({ force: true, noWaitAfter: true }).catch(() => {});
  }
}
async function dragAway(selector, dx) {
  const box = await page.locator(selector).first().boundingBox();
  if (!box) return;
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  const n = Math.round(400 / FRAME);
  for (let i = 1; i <= n; i++) {
    await page.mouse.move(x + (dx * i) / n, y - (30 * i) / n);
    await tick();
  }
  await page.mouse.up();
}

/* ------------------------------------------------------------------ the reel */

async function storyboard() {
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.mouse.move(200, 400);

  // 1. Preloader and the word-mask hero, then walk through the letters into the room.
  await hold(4200);
  await scrollBy(2600, 5200);
  await hold(900);

  // 2. Manifesto: photos open between the words.
  await scrollToEl(".mf-text", 1400, 0.2);
  await scrollBy(700, 2600);

  // 3. Collections strips.
  await scrollToEl(".st-strip", 1500, 0.25);
  await hold(600);

  // 4. Shop the room: tap two markers.
  await scrollToEl(".sr-frame", 1600, 0.2);
  await hold(1400);
  await tapIfVisible(".sr-dot", 0);
  await hold(1300);
  await tapIfVisible(".sr-dot", 1);
  await hold(1300);

  // 5. Blinds reveal (pinned).
  await scrollToEl(".bl-slat", 1200, 0);
  await scrollBy(1500, 3200);
  await hold(700);

  // 6. Product row and the floor plan story (pinned).
  await scrollBy(1100, 1800);
  await scrollToEl(".fp-wall", 1200, 0.45);
  await scrollBy(2000, 4600);
  await hold(400);

  // 7. Throw two testimonial cards.
  await scrollToEl("[data-top='true']", 1600, 0.3);
  await settle();
  await dragAway("[data-top='true']", -320);
  await hold(900);
  await dragAway("[data-top='true']", 320);
  await hold(900);

  // 8. Photo trail and the footer.
  await scrollToEl("h2.h-giant", 1600, 0.3);
  await hold(2200);
  await scrollBy(4000, 2400);
  await hold(900);

  // 9. Menu, curtain transition into the shop, open a product.
  await scrollBy(-250, 700); // scrolling up brings the header back
  await hold(400);
  await page.locator("button[aria-expanded]").click({ noWaitAfter: true });
  await hold(1600);
  await page.locator("[data-open='true'] a", { hasText: "Shop" }).first().click({ noWaitAfter: true });
  await tickUntilUrl(/\/shop$/);
  await hold(1800);
  await scrollBy(900, 2000);
  await hold(500);
  await page.locator("a[href^='/shop/']").first().click({ noWaitAfter: true });
  await tickUntilUrl(/\/shop\/.+/);
  await hold(2200);
  await scrollBy(700, 1800);
  await hold(1200);
}

/* ------------------------------------------------------------------ main */

async function main() {
  await startServer();
  await warmUp(["/", "/shop", "/shop/sitara-velvet-sofa"]);

  rmSync(FRAMES, { recursive: true, force: true });
  mkdirSync(FRAMES, { recursive: true });

  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  // 432x768 CSS pixels at 2.5x density = a crisp 1080x1920 phone screen.
  const context = await browser.newContext({
    viewport: { width: 432, height: 768 },
    deviceScaleFactor: 2.5,
    isMobile: true,
    hasTouch: true,
    reducedMotion: "no-preference",
  });
  page = await context.newPage();
  await page.clock.install();

  console.log(`Recording at ${FPS} fps. This takes a few minutes...`);
  const t0 = Date.now();
  await storyboard();
  await browser.close();
  console.log(`Captured ${frame} frames (${(frame / FPS).toFixed(1)}s of video) in ${Math.round((Date.now() - t0) / 1000)}s.`);

  let ffmpeg = "ffmpeg";
  try {
    ffmpeg = (await import("ffmpeg-static")).default || ffmpeg;
  } catch {}
  console.log("Encoding MP4...");
  const r = spawnSync(
    ffmpeg,
    [
      "-y",
      "-framerate", String(FPS),
      "-i", path.join(FRAMES, "%05d.jpg"),
      "-vf", "scale=1080:1920:flags=lanczos,format=yuv420p",
      "-c:v", "libx264",
      "-preset", "slow",
      "-crf", "18",
      "-movflags", "+faststart",
      OUT,
    ],
    { stdio: "inherit" },
  );
  if (r.status !== 0 || !existsSync(OUT)) throw new Error("ffmpeg could not encode the video.");
  if (!args.keepFrames) rmSync(FRAMES, { recursive: true, force: true });
  console.log("\nDone! Your reel is at:", OUT);
}

main()
  .catch((e) => {
    console.error("\n" + (e?.message || e));
    if (String(e?.message).includes("Executable doesn't exist")) {
      console.error("Run this once, then try again:  npx playwright install chromium");
    }
    process.exitCode = 1;
  })
  .finally(() => server?.kill());
