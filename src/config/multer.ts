import multer from "multer";
import path from "path";
import fs from "fs";

// Garante que o diretório existe
const UPLOADS_DIR = path.resolve("uploads/logos");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, _file, cb) => {
    const oficinaId = req.params.id ?? "unknown";
    const ext = path.extname(_file.originalname).toLowerCase();
    // Nome fixo por oficina — sobrescreve sempre
    cb(null, `oficina-${oficinaId}${ext}`);
  },
});

function fileFilter(_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const allowed = [".jpg", ".jpeg", ".png", ".webp"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Apenas imagens JPG, PNG ou WebP são aceitas."));
  }
}

export const uploadLogo = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // máx 2MB
}).single("logo");
