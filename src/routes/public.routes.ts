import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

/**
 * GET /public/oficinas
 * Endpoint público para o frontend montar o dropdown de escolha de oficina no login.
 */
router.get("/oficinas", async (req, res) => {
  const oficinas = await prisma.oficina.findMany({
    select: { id: true, nome: true, responsavel: true },
    orderBy: { id: "asc" },
  });

  return res.json(oficinas);
});

export { router as publicRoutes };