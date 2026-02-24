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

export { router as registroTecnicoRoutes };