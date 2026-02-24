import { Router } from "express";
import { VeiculoController } from "../controllers/veiculo.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const veiculoController = new VeiculoController();

// Protege todas as rotas de veículos
router.use(authMiddleware);

// POST /veiculos
router.post("/", (req, res) => veiculoController.create(req, res));

// GET /veiculos (opcional: ?clienteId=1)
router.get("/", (req, res) => veiculoController.list(req, res));

export { router as veiculoRoutes };