import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup logging to a file to debug on FlyEnv
const logStream = fs.createWriteStream(
  path.join(__dirname, "flyenv_debug.log"),
  { flags: "a" },
);
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  console.log(msg);
  logStream.write(line);
}

log("=== Starting server.js ===");

process.on("uncaughtException", (err) => {
  log(`UNCAUGHT EXCEPTION: ${err.message}\n${err.stack}`);
});

const app = express();

let PORT = process.env.PORT || 3000;
const portArgIndex = process.argv.indexOf("--port");
if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
  PORT = Number(process.argv[portArgIndex + 1]);
}
log(`PORT resolved to: ${PORT}`);
log(`process.env.PORT is: ${process.env.PORT}`);

const distPath = path.join(__dirname, "dist");
log(`Dist path: ${distPath}`);

if (!fs.existsSync(distPath)) {
  log("ERROR: Folder 'dist' TIDAK DITEMUKAN!");
}

app.use(express.static(distPath));

app.use((req, res) => {
  const indexPath = path.join(distPath, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(500).send("<h1>Aplikasi React belum dibuild!</h1>");
  }
});

app
  .listen(PORT, "0.0.0.0", () => {
    log(`Server is running on 0.0.0.0:${PORT}`);
  })
  .on("error", (err) => {
    log(`LISTEN ERROR: ${err.message}\n${err.stack}`);
  });
