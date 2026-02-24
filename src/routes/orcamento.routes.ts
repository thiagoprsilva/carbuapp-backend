import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { OrcamentoController } from "../controllers/orcamento.controller";

const router = Router();
const controller = new OrcamentoController();

router.use(authMiddleware);

router.post("/", (req, res) => controller.create(req, res));
router.get("/", (req, res) => controller.list(req, res));

export { router as orcamentoRoutes };