import { Router } from "express";
import { RegistroTecnicoController } from "../controllers/registroTecnico.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const controller = new RegistroTecnicoController();

// todas protegidas
router.use(authMiddleware);

// /registros
router.get("/", (req, res) => controller.list(req, res));
router.post("/", (req, res) => controller.create(req, res));
router.put("/:id", (req, res) => controller.update(req, res));
router.delete("/:id", (req, res) => controller.remove(req, res));

export { router as registroTecnicoRoutes };