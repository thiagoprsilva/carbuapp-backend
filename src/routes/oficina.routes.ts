import { Router } from "express";
import { OficinaController } from "../controllers/oficina.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/requireAdmin.middleware";
import { requireSuperAdmin } from "../middlewares/requireSuperAdmin.middleware";
import { uploadLogo } from "../config/multer";

const router = Router();
const ctrl = new OficinaController();

// Todas as rotas exigem autenticação
router.use(authMiddleware);

// ── Rotas SUPERADMIN ──────────────────────────────────────────────────────────
// Listar todas as oficinas
router.get("/", requireSuperAdmin, (req, res) => ctrl.listar(req, res));

// Detalhes de uma oficina
router.get("/:id", requireSuperAdmin, (req, res) => ctrl.detalhe(req, res));

// Criar nova oficina
router.post("/", requireSuperAdmin, (req, res) => ctrl.criar(req, res));

// ── Rotas ADMIN + SUPERADMIN ──────────────────────────────────────────────────
// Editar dados da oficina
router.patch("/:id", requireAdmin, (req, res) => ctrl.atualizar(req, res));

// Upload de logo (admin edita a sua; superadmin edita qualquer)
router.post("/:id/logo", requireAdmin, uploadLogo, (req, res) => ctrl.uploadLogo(req, res));

// Remover logo
router.delete("/:id/logo", requireAdmin, (req, res) => ctrl.removerLogo(req, res));

export { router as oficinaRoutes };
