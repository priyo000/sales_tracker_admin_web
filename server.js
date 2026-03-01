import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Cari PORT dari environment variabel, ATAU dari panel (misal disuntikkan argumen --port 3099)
let PORT = process.env.PORT || 3000;
const portArgIndex = process.argv.indexOf("--port");
if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
  PORT = Number(process.argv[portArgIndex + 1]);
}

const distPath = path.join(__dirname, "dist");
if (!fs.existsSync(distPath)) {
  console.error(
    "=========================================================================",
  );
  console.error(" [ERROR] Folder 'dist' TIDAK DITEMUKAN!");
  console.error(
    " Tolong jalankan perintah 'npm run build' terlebih dahulu sebelum start.",
  );
  console.error(
    "=========================================================================",
  );
}

app.use(express.static(distPath));

app.use((req, res) => {
  const indexPath = path.join(distPath, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res
      .status(500)
      .send(
        "<h1>Aplikasi React belum dibuild!</h1><p>Masuk ke terminal server dan jalankan <code>npm install</code> lalu <code>npm run build</code>.</p>",
      );
  }
});

// Gunakan 0.0.0.0 agar bisa diakses dari IP jaringan luar jika tidak diproxy
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
