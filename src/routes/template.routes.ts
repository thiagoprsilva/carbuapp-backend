import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { TemplateController } from "../controllers/template.controller";

const router = Router();
const controller = new TemplateController();

router.use(authMiddleware);

router.get("/", (req, res) => controller.list(req, res));
router.post("/", (req, res) => controller.create(req, res));
router.put("/:id", (req, res) => controller.update(req, res));
router.delete("/:id", (req, res) => controller.delete(req, res));

export { router as templateRoutes };
