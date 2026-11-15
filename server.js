// Zero-dependency static server (works on Windows/macOS/Linux; only Node.js needed)
// Usage: npm start   ->  http://localhost:8080/
const http = require("http");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const PORT = process.env.PORT || 8080;
const ROOT = __dirname;
const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json", ".side": "application/json",
  ".png": "image/png", ".ico": "image/x-icon", ".svg": "image/svg+xml"
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/test_runner.html";
  const filePath = path.normalize(path.join(ROOT, urlPath));
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); return res.end("Forbidden"); }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); return res.end("Not found: " + urlPath); }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(filePath)] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(data);
  });
});

server.on("error", e => {
  if (e.code === "EADDRINUSE") console.error(`Port ${PORT} is busy. Close the other server or run: set PORT=8081 && npm start`);
  else console.error(e);
  process.exit(1);
});

server.listen(PORT, () => {
  const dash = `http://localhost:${PORT}/test_runner.html`;
  console.log("=".repeat(70));
  console.log(" STQA MINI-PROJECT: ONLINE APPOINTMENT BOOKING SYSTEM");
  console.log("=".repeat(70));
  console.log(` Test dashboard : ${dash}`);
  console.log(` App under test : http://localhost:${PORT}/app/index.html`);
  console.log(" Press Ctrl+C to stop.\n");
  const opener = process.platform === "win32" ? `start "" "${dash}"` : process.platform === "darwin" ? `open "${dash}"` : `xdg-open "${dash}"`;
  exec(opener, () => {});
});
