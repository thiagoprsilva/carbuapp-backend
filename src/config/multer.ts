import multer from "multer";
import path from "path";
import fs from "fs";

function imageFilter(_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const allowed = [".jpg", ".jpeg", ".png", ".webp"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Apenas imagens JPG, PNG ou WebP são aceitas."));
  }
}

// ── Logo da oficina ──────────────────────────────────────────────────────────
const LOGOS_DIR = path.resolve("uploads/logos");
if (!fs.existsSync(LOGOS_DIR)) fs.mkdirSync(LOGOS_DIR, { recursive: true });

const logoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, LOGOS_DIR),
  filename: (req, _file, cb) => {
    const oficinaId = req.params.id ?? "unknown";
    const ext = path.extname(_file.originalname).toLowerCase();
    cb(null, `oficina-${oficinaId}${ext}`);
  },
});

export const uploadLogo = multer({
  storage: logoStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
}).single("logo");

// ── Fotos de orçamentos ──────────────────────────────────────────────────────
const FOTOS_DIR = path.resolve("uploads/fotos");
if (!fs.existsSync(FOTOS_DIR)) fs.mkdirSync(FOTOS_DIR, { recursive: true });

const fotoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, FOTOS_DIR),
  filename: (_req, file, cb) => {
    const ts = Date.now();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `foto-${ts}${ext}`);
  },
});

export const upload = multer({
  storage: fotoStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 8 * 1024 * 1024 }, // máx 8MB por foto
});
