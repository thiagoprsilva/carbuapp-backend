import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import rateLimit from "express-rate-limit";

// Cria roteador do Express
const router = Router();

// Instancia controller
const authController = new AuthController();

// Rate limit para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo de 10 tentativas por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Muitas tentativas de login. Tente novamente em alguns minutos."
  }
});

/**
 * POST /auth/login
 */
router.post("/login", loginLimiter, (req, res) =>
  authController.login(req, res)
);

// Retorna dados do usuário autenticado
router.get("/me", authMiddleware, (req, res) =>
  authController.me(req, res)
);

// Alterar a própria senha (qualquer role autenticado)
router.patch("/senha", authMiddleware, (req, res) =>
  authController.alterarSenha(req, res)
);

export { router as authRoutes };