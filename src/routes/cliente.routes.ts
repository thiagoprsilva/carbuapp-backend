import { Router } from "express";
import { ClienteController } from "../controllers/cliente.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const clienteController = new ClienteController();

/**
 * Todas as rotas de cliente precisam de login,
 * então aplicamos o middleware aqui.
 */
router.use(authMiddleware);

/**
 * POST /clientes
 * Cria cliente
 */
router.post("/", (req, res) => clienteController.create(req, res));

/**
 * GET /clientes
 * Lista clientes
 */
router.get("/", (req, res) => clienteController.list(req, res));

// update e delete
router.put("/:id", (req, res) => clienteController.update(req, res));
router.delete("/:id", (req, res) => clienteController.delete(req, res));


export { router as clienteRoutes };