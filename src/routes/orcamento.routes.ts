import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { OrcamentoController } from "../controllers/orcamento.controller";
import { OrcamentoPdfController } from "../controllers/orcamentoPdf.controller";

const router = Router();
const controller = new OrcamentoController();
const pdfController = new OrcamentoPdfController();

router.use(authMiddleware);

router.post("/", (req, res) => controller.create(req, res));
router.get("/", (req, res) => controller.list(req, res));
router.get("/:id/pdf", (req, res) => pdfController.download(req, res));

export { router as orcamentoRoutes };