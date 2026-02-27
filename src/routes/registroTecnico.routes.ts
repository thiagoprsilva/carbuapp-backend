import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { RegistroTecnicoController } from "../controllers/registroTecnico.controller";

const router = Router();
const controller = new RegistroTecnicoController();

// Protege todas as rotas
router.use(authMiddleware);

// POST /registros-tecnicos
router.post("/", (req, res) => controller.create(req, res));

// GET /registros-tecnicos
router.get("/", (req, res) => controller.list(req, res));

// PUT /registros-tecnicos
router.put("/:id", (req, res) => controller.update(req, res));

// DELETE /registros-tecnicos
router.delete("/:id", (req, res) => controller.delete(req, res));

export { router as registroTecnicoRoutes };