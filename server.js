import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Mendapatkan path directory (karena type: "module" di package.json)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Set Port (biasanya FlyEnv akan menyuntikkan port lewat process.env.PORT, jika tidak ada default ke 3000)
const PORT = process.env.PORT || 3000;

// Melayani file statis dari folder "dist" (hasil build Vite)
app.use(express.static(path.join(__dirname, "dist")));

// Menangkap semua routing (Catch-all) dan diarahkan ke index.html di dalam folder dist
// (Penting agar React Router berfungsi tanpa error 404 saat direfresh)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
