import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";


// Cria roteador do Express
const router = Router();


// Instancia controller
const authController = new AuthController();

/**
 * POST /auth/login
 * Essa rota chama o método login do controller
 */
router.post("/login", (req, res) => authController.login(req, res));


// Rota protegida: só acessa se token for válido
router.get("/me", authMiddleware, (req, res) => authController.me(req, res));


// Exporta rota para ser usada no server
export { router as authRoutes };