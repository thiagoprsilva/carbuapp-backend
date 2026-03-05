import { Router } from "express";
import { prisma } from "../prisma";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

/**
 * GET /api/search?q=texto
 * Busca global em Cliente, Veiculo, Orcamento e RegistroTecnico,
 * sempre limitada à oficina do usuário autenticado.
 */
router.get("/search", authMiddleware, async (req, res) => {
  try {
    const qRaw = req.query.q;
    const q = typeof qRaw === "string" ? qRaw.trim() : "";

    const oficinaId = req.user!.oficinaId;
    const userId = req.user!.id;

    console.log("[SEARCH]", {
      q,
      oficinaId: req.user?.oficinaId,
      userId: req.user?.id,
    });

    // Quando q vier vazio, retornamos sucesso com lista vazia
    if (!q) {
      return res.json({
        q: "",
        results: [],
      });
    }

    // Tenta interpretar q como número para busca por ID de orçamento
    const qNumber = Number(q);
    const isNumeric = !Number.isNaN(qNumber);

    const [clientes, veiculos, orcamentos, registros] = await Promise.all([
      // CLIENTES: busca por nome/telefone
      prisma.cliente.findMany({
        where: {
          oficinaId,
          OR: [
            { nome: { contains: q } },
            { telefone: { contains: q } },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),

      // VEICULOS: busca por placa/modelo/ano/motor/alimentacao
      prisma.veiculo.findMany({
        where: {
          oficinaId,
          OR: [
            { placa: { contains: q } },
            { modelo: { contains: q } },
            { ano: { contains: q } },
            { motor: { contains: q } },
            { alimentacao: { contains: q } },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          cliente: {
            select: { id: true, nome: true },
          },
        },
      }),

      // ORCAMENTOS: busca por numero (se q for número) e dados do veículo/cliente
      prisma.orcamento.findMany({
        where: {
          oficinaId,
          OR: [
            ...(isNumeric ? [{ numero: qNumber }] : []),
            {
              veiculo: {
                OR: [
                  { placa: { contains: q } },
                  { modelo: { contains: q } },
                  {
                    cliente: {
                      nome: { contains: q },
                    },
                  },
                ],
              },
            },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          veiculo: {
            include: {
              cliente: { select: { id: true, nome: true } },
            },
          },
        },
      }),

      // REGISTROS TÉCNICOS: busca em categoria, descricao e observacoes
      prisma.registroTecnico.findMany({
        where: {
          oficinaId,
          OR: [
            { categoria: { contains: q } },
            { descricao: { contains: q } },
            { observacoes: { contains: q } },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          veiculo: {
            include: {
              cliente: { select: { id: true, nome: true } },
            },
          },
          orcamento: {
            select: { id: true, numero: true },
          },
        },
      }),
    ]);

    const results = [
      // Clientes
      ...clientes.map((c) => ({
        type: "CLIENTE" as const,
        id: c.id,
        title: c.nome,
        subtitle: c.telefone ?? "",
        href: `/clientes/${c.id}`,
      })),

      // Veículos
      ...veiculos.map((v) => ({
        type: "VEICULO" as const,
        id: v.id,
        title: `${v.modelo} (${v.placa})`,
        subtitle:
          v.cliente?.nome ??
          v.motor ??
          v.ano ??
          "",
        href: `/veiculos/${v.id}`,
      })),

      // Orçamentos
      ...orcamentos.map((o) => ({
        type: "ORCAMENTO" as const,
        id: o.id,
        title: `Orçamento #${o.numero}`,
        subtitle: [
          o.veiculo?.cliente?.nome,
          o.veiculo ? `${o.veiculo.modelo} (${o.veiculo.placa})` : undefined,
        ]
          .filter(Boolean)
          .join(" - "),
        href: `/orcamentos/${o.id}`,
      })),

      // Registros Técnicos
      ...registros.map((r) => ({
        type: "REGISTRO" as const,
        id: r.id,
        title: r.categoria,
        subtitle: r.veiculo
          ? `${r.veiculo.modelo} (${r.veiculo.placa}) - ${r.veiculo.cliente?.nome ?? ""}`
          : "",
        href: `/registroTecnico/${r.id}`,
      })),
    ];

    return res.json({
      q,
      results,
    });
  } catch (error: any) {
    console.error("Erro na busca global:", error);
    return res.status(500).json({ message: "Erro ao executar busca global." });
  }
});

export { router as searchRoutes };

