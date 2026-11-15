// Selenium WebDriver regression suite (Node.js)
// Run:  npm test              (headless Chrome)
//       npm run test:headless (no window)
//       npm run test:edge     (Microsoft Edge - already installed on Windows)
const { Builder, By } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const edge = require("selenium-webdriver/edge");
const path = require("path");
const fs = require("fs");
const { pathToFileURL } = require("url");

const useEdge = process.argv.includes("--edge");
const headed = !process.argv.includes("--headless") && process.env.HEADLESS !== "1"; // visible window by default

// Local calendar date (YYYY-MM-DD) with day offset - matches the app's own "today"
function localDate(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

async function buildDriver() {
  const args = ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--window-size=1100,900"];
  if (!headed) args.push("--headless=new");
  const builder = new Builder();
  if (useEdge) {
    const o = new edge.Options(); o.addArguments(...args);
    return builder.forBrowser("MicrosoftEdge").setEdgeOptions(o).build();
  }
  const o = new chrome.Options(); o.addArguments(...args);
  return builder.forBrowser("chrome").setChromeOptions(o).build();
}

async function runTests() {
  console.log("=".repeat(78));
  console.log("  ONLINE APPOINTMENT BOOKING SYSTEM - SELENIUM REGRESSION SUITE");
  console.log("  Software Testing and Quality Assurance");
  console.log("=".repeat(78) + "\n");

  console.log("Starting browser... (first run can take up to a minute while Selenium downloads the driver)\n");
  let driver;
  try {
    driver = await buildDriver();
  } catch (e) {
    console.error("Could not start the browser: " + e.message);
    console.error("Make sure Google Chrome is installed (or use: npm run test:edge) and you are online");
    console.error("the first time so Selenium can download the matching driver.");
    process.exit(1);
  }

  const url = pathToFileURL(path.resolve(__dirname, "app", "index.html")).href;
  let passed = 0, failed = 0;
  const results = [];

  // Helpers (date inputs are locale-dependent, so the value is set directly)
  const $ = id => driver.findElement(By.id(id));
  const setText = async (id, v) => { const el = await $(id); await el.clear(); await el.sendKeys(v); };
  const setDate = v => driver.executeScript("document.getElementById('date').value = arguments[0];", v);
  const pickSlot = label => driver.findElement(By.xpath(`//select[@id='slot']/option[normalize-space()='${label}']`)).click();
  const book = () => $("bookButton").click();
  const fillForm = async ({ name, email, date, slot }) => {
    if (name !== undefined) await setText("name", name);
    if (email !== undefined) await setText("email", email);
    if (date !== undefined) await setDate(date);
    if (slot) await pickSlot(slot);
  };

  async function test(id, scenario, fill, expected) {
    const t0 = Date.now();
    let status = "FAIL", actual = "";
    try {
      await driver.get(url);           // fresh page = fresh in-memory state
      await fill();
      actual = await $("message").getText();
      if (actual.toLowerCase().includes(expected.toLowerCase())) { status = "PASS"; passed++; }
      else failed++;
    } catch (e) { actual = e.message.split("\n")[0]; failed++; }
    const tag = status === "PASS" ? "\x1b[32mPASS\x1b[0m" : "\x1b[31mFAIL\x1b[0m";
    console.log(`[${tag}] ${id}: ${scenario}` + (status === "FAIL" ? `\n        expected "${expected}", got "${actual}"` : ""));
    results.push({ id, scenario, expected, actual, status, durationMs: Date.now() - t0, date: new Date().toISOString() });
  }

  const FUTURE = "2030-10-25";
  try {
    await test("TC01 / RT01", "Valid appointment booking", async () => {
      await fillForm({ name: "Test User", email: "test@example.com", date: FUTURE, slot: "10:00 AM" });
      await book();
    }, "Appointment confirmed for Test User");

    await test("TC02 / RT02", "Empty form validation", async () => { await book(); }, "Please complete all fields");

    await test("TC03 / RT03", "Invalid email rejection", async () => {
      await fillForm({ name: "Test User", email: "wrong-email", date: FUTURE, slot: "10:00 AM" });
      await book();
    }, "Enter a valid email address");

    await test("TC04 / RT04", "Past date rejection", async () => {
      await fillForm({ name: "Test User", email: "test@example.com", date: "2020-01-01", slot: "10:00 AM" });
      await book();
    }, "Past dates are not allowed");

    await test("TC05 / RT05", "No slot selected", async () => {
      await fillForm({ name: "Test User", email: "test@example.com", date: FUTURE });
      await book();
    }, "Please complete all fields");

    await test("TC06 / RT06", "Duplicate slot rejection", async () => {
      await fillForm({ name: "User One", email: "user1@example.com", date: FUTURE, slot: "11:00 AM" });
      await book();
      await fillForm({ name: "User Two", email: "user2@example.com" });
      await book();
    }, "This time slot is unavailable");

    await test("TC07 / RT07", "Booking cancellation", async () => {
      await fillForm({ name: "Cancel User", email: "cancel@example.com", date: FUTURE, slot: "12:00 PM" });
      await book();
      await $("cancelButton").click();
    }, "Appointment cancelled");

    await test("TC08", "Retry after invalid input", async () => {
      await fillForm({ name: "Retry User", email: "invalid" });
      await book();
      await fillForm({ email: "valid@domain.com", date: FUTURE, slot: "10:00 AM" });
      await book();
    }, "Appointment confirmed");

    await test("BV01", "Boundary: yesterday", async () => {
      await fillForm({ name: "BV User", email: "bv@test.com", date: localDate(-1), slot: "10:00 AM" });
      await book();
    }, "Past dates are not allowed");

    await test("BV02", "Boundary: today", async () => {
      await fillForm({ name: "Today User", email: "today@test.com", date: localDate(0), slot: "10:00 AM" });
      await book();
    }, "Appointment confirmed");

    await test("BV03", "Boundary: tomorrow", async () => {
      await fillForm({ name: "Tomorrow User", email: "tomorrow@test.com", date: localDate(1), slot: "11:00 AM" });
      await book();
    }, "Appointment confirmed");

    await test("BV04", "Boundary: blank date", async () => {
      await fillForm({ name: "Blank Date User", email: "test@test.com", slot: "10:00 AM" });
      await book();
    }, "Please complete all fields");

    await test("BV05", "Boundary: email without @ / domain", async () => {
      await fillForm({ name: "Invalid Email User", email: "plainaddress", date: FUTURE, slot: "10:00 AM" });
      await book();
    }, "Enter a valid email address");
  } finally {
    await driver.quit();
  }

  const total = passed + failed;
  console.log("\n" + "=".repeat(78));
  console.log("  TEST EXECUTION REPORT (SECTION 18)");
  console.log("=".repeat(78));
  console.log(`  Total: ${total}   Passed: ${passed}   Failed: ${failed}   Pass rate: ${((passed / total) * 100).toFixed(1)}%`);
  console.log("-".repeat(78));
  for (const r of results) console.log("  " + r.id.padEnd(14) + r.status.padEnd(8) + r.scenario.padEnd(40) + r.durationMs + "ms");
  console.log("=".repeat(78));

  fs.writeFileSync(path.resolve(__dirname, "test_execution_report.json"),
    JSON.stringify({ summary: { total, passed, failed }, results }, null, 2));
  console.log("  Report saved: test_execution_report.json\n");
  process.exit(failed ? 1 : 0);
}

runTests().catch(err => { console.error("Test execution failed:", err); process.exit(1); });
