import { Router } from "express";
import { UsuarioController } from "../controllers/usuario.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/requireAdmin.middleware";

const router = Router();
const ctrl = new UsuarioController();

// Todas as rotas exigem autenticação + ser ADMIN ou SUPERADMIN
router.use(authMiddleware, requireAdmin);

// Listar usuários (admin: só da sua oficina; superadmin: ?oficinaId=X ou todos)
router.get("/", (req, res) => ctrl.listar(req, res));

// Criar usuário
router.post("/", (req, res) => ctrl.criar(req, res));

// Atualizar nome / role / ativo
router.patch("/:id", (req, res) => ctrl.atualizar(req, res));

// Admin redefine senha de outro usuário
router.post("/:id/reset-senha", (req, res) => ctrl.redefinirSenha(req, res));

export { router as usuarioRoutes };
