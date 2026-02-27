import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

/**
 * GET /public/oficinas
 * Endpoint público para listar oficinas antes do login.
 * Usado pelo frontend para montar dropdown de escolha.
 */
router.get("/oficinas", async (req, res) => {
  try {
    const oficinas = await prisma.oficina.findMany({
      select: {
        id: true,
        nome: true,
        responsavel: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    return res.json(oficinas);
  } catch (error: any) {
    return res.status(500).json({
      message: "Erro ao buscar oficinas",
    });
  }
});

export { router as publicRoutes };