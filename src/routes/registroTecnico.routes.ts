import { Router } from "express";
import { RegistroTecnicoController } from "../controllers/registroTecnico.controller";
import { LaudoController } from "../controllers/laudo.controller";
import { FotoController } from "../controllers/foto.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { upload } from "../config/multer";

const router = Router();
const controller = new RegistroTecnicoController();
const laudoController = new LaudoController();
const fotoController = new FotoController();

router.use(authMiddleware);

// IMPORTANTE: rotas específicas ANTES de /:id para evitar conflito de params

// Listagem e criação
router.get("/", (req, res) => controller.list(req, res));
router.post("/", (req, res) => controller.create(req, res));

// Laudo de entrada (sub-recurso da OS)
router.post("/:id/laudo", (req, res) => laudoController.upsert(req, res));
router.get("/:id/laudo", (req, res) => laudoController.get(req, res));
router.delete("/:id/laudo", (req, res) => laudoController.delete(req, res));

// Fotos (sub-recurso da OS)
router.post("/:id/fotos", upload.single("foto"), (req, res) => fotoController.upload(req, res));
router.get("/:id/fotos", (req, res) => fotoController.list(req, res));
router.delete("/:id/fotos/:fotoId", (req, res) => fotoController.delete(req, res));

// Status
router.patch("/:id/status", (req, res) => controller.updateStatus(req, res));

// Detalhe, edição e remoção — SEMPRE depois das sub-rotas
router.get("/:id", (req, res) => controller.getById(req, res));
router.put("/:id", (req, res) => controller.update(req, res));
router.delete("/:id", (req, res) => controller.remove(req, res));

export { router as registroTecnicoRoutes };
