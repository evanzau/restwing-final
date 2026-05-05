// app.js — Puppeteer test for RestWing

const puppeteer = require("puppeteer");

const BASE_URL = "https://project-restwing.web.app";
const TEST_EMAIL = "testuser@restwing.com";

async function testWaitlistSignup(page) {
  console.log("=== RestWing: Waitlist Signup Test ===");

  console.log("\n[1] Opening homepage...");
  await page.goto(`${BASE_URL}/index.html`, { waitUntil: "networkidle2" });
  console.log("    ✓ Homepage loaded.");

  console.log("\n[2] Scrolling to waitlist form...");
  // scroll down in small increments so it's visible on screen
  await page.evaluate(async () => {
    await new Promise(resolve => {
      let total = 0;
      const target = document.getElementById("waitlist-form").offsetTop;
      const timer = setInterval(() => {
        window.scrollBy(0, 18);
        total += 18;
        if (total >= target) {
          clearInterval(timer);
          resolve();
        }
      }, 15);
    });
  });
  await new Promise(resolve => setTimeout(resolve, 800));
  console.log("    ✓ Scrolled to waitlist.");

  console.log("\n[3] Entering email...");
  await page.type("#waitlist-email", TEST_EMAIL);
  console.log(`    ✓ Typed: ${TEST_EMAIL}`);

  console.log("\n[4] Clicking 'Get Early Access'...");
  await page.click("#waitlist-form button[type='submit']");
  console.log("    ✓ Button clicked.");

  console.log("\n[5] Waiting for success message...");
  await page.waitForSelector("#waitlist-msg", { visible: true, timeout: 8000 });

  const msgText = await page.$eval("#waitlist-msg", el => el.textContent.trim());
  console.log(`    Message shown: "${msgText}"`);

  if (!msgText.includes("You're on the list")) {
    throw new Error(`Unexpected message: ${msgText}`);
  }

  console.log("\n✅ Test passed — waitlist signup is working.\n");
}

async function go() {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    await testWaitlistSignup(page);
  } catch (err) {
    console.error(`\n❌ Test failed: ${err.message}\n`);
  } finally {
    await new Promise(resolve => setTimeout(resolve, 3000));
    await browser.close();
  }
}

go();