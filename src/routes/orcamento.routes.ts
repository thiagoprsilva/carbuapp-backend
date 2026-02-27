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
router.put("/:id", (req, res) => controller.update(req, res));
router.delete("/:id", (req, res) => controller.delete(req, res));


export { router as orcamentoRoutes };