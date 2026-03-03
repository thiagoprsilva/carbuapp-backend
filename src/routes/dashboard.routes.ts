import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { DashboardController } from "../controllers/dashboard.controller";

const router = Router();
const controller = new DashboardController();

router.get("/summary", authMiddleware, (req, res) => controller.summary(req, res));

export default router;