# Online Appointment Booking System Testing using Selenium WebDriver/IDE
### Software Testing and Quality Assurance (STQA) Mini-Project
Department of Computer Engineering, PCCOER

**Submitted by:** Siddhi Pankhade (TECOC38), Akash Patil (TECOC42), Samiksha Ner (TECOC31), Arya Naik (TECOC28)
**Submitted to:** Dr. Vijay A. Kotkar

## Folder structure
```
appointment_booking_stqa/
├── app/                      Application under test (index.html, script.js, style.css)
├── test_runner.html          Browser test dashboard (20 test cases + CSV export)
├── server.js                 Tiny local web server (needs only Node.js)
├── test_regression.js        Selenium WebDriver script (Node.js)
├── appointment_booking.side  Selenium IDE project
└── package.json
```

## One-time setup (Windows + VS Code)
1. Install **Node.js LTS** (https://nodejs.org) and **Google Chrome**. Restart VS Code afterwards.
2. In VS Code: *File > Open Folder* > `appointment_booking_stqa`, then open the terminal (**Ctrl + `**).
3. Run: `npm install`  (needs internet; installs selenium-webdriver)

If PowerShell blocks `npm` ("running scripts is disabled"), run once:
`Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, or switch the terminal to *Command Prompt*.

## 1. Browser test dashboard (best for demo)
```
npm start
```
Opens http://localhost:8080/test_runner.html. Click **Execute Automated Test Suite**, then
**Export Test Execution Report (CSV)** for Sections 18/19 of the report.
(Open it through `npm start`; double-clicking the HTML file will not work because the app runs in an iframe.)

## 2. Selenium WebDriver script
```
npm test                # opens Chrome and you watch the tests run
npm run test:headless   # same, but with no browser window
npm run test:edge       # use Microsoft Edge instead
```
Prints a pass/fail table and saves `test_execution_report.json`. The first run needs internet so
Selenium can download the matching browser driver automatically.

## 3. Selenium IDE (record & playback)
1. Start the server: `npm start` (keep it running).
2. Install the **Selenium IDE** extension in Chrome (Chrome Web Store).
3. Open it > *Open an existing project* > select `appointment_booking.side`.
4. Click **Run all tests**. (Project base URL is http://localhost:8080; pages open at `/app/index.html`.)

## Test cases
TC01-TC08 (functional/negative), BV01-BV05 (boundary value), RT01-RT07 (regression; these reuse the
same scenarios as TC01-TC07). Each test starts from a freshly loaded page so the in-memory bookings
of one test never affect another.

## Recording results
Run the tests, then copy the actual results into Section 18 of the report. Do not state a pass rate
until you have run them yourselves.

## Troubleshooting
| Problem | Fix |
|---|---|
| `Could not start the browser` | Install Chrome, check internet (first run), or try `npm run test:edge` |
| `Port 8080 is busy` | Close other server, or `set PORT=8081 && npm start` (Command Prompt) |
| Dashboard shows "Cannot access app frame" | Open via `npm start`, not by double-click |
| `npm` not recognised | Install Node.js, restart VS Code |
