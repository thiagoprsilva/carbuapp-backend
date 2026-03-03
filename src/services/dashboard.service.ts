import { prisma } from "../prisma";

export class DashboardService {
  async summary(oficinaId: number) {
    const [clientes, veiculos, registros, orcamentos] = await Promise.all([
      prisma.cliente.count({ where: { oficinaId } }),
      prisma.veiculo.count({ where: { oficinaId } }),
      prisma.registroTecnico.count({ where: { oficinaId } }),
      prisma.orcamento.count({ where: { oficinaId } }),
    ]);

    const ultimosRegistros = await prisma.registroTecnico.findMany({
      where: { oficinaId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        veiculo: {
          select: {
            id: true,
            placa: true,
            modelo: true,
            cliente: { select: { id: true, nome: true } },
          },
        },
        orcamento: { select: { id: true, numero: true } },
      },
    });

    const ultimosOrcamentos = await prisma.orcamento.findMany({
      where: { oficinaId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        numero: true,
        total: true,
        createdAt: true,
        veiculo: {
          select: {
            id: true,
            placa: true,
            modelo: true,
            cliente: { select: { id: true, nome: true } },
          },
        },
      },
    });

    return {
      totais: { clientes, veiculos, registros, orcamentos },
      recentes: { registros: ultimosRegistros, orcamentos: ultimosOrcamentos },
    };
  }
}