import { prisma } from "../prisma";

type CreateRegistroDTO = {
  veiculoId: number;
  categoria: string;
  descricao: string;
  dataServico: string; // vem do front como "YYYY-MM-DD"
  observacoes?: string | null;
};

type UpdateRegistroDTO = {
  veiculoId?: number;
  categoria?: string;
  descricao?: string;
  dataServico?: string; // "YYYY-MM-DD"
  observacoes?: string | null;
};

export class RegistroTecnicoService {
  /**
   * Lista registros da oficina logada
   */
  async list(oficinaId: number) {
    return prisma.registroTecnico.findMany({
      where: { oficinaId },
      include: {
        veiculo: {
          include: {
            cliente: { select: { id: true, nome: true } },
          },
        },
      },
      orderBy: { dataServico: "desc" }, // mais recente primeiro
    });
  }

  /**
   * Cria registro técnico
   */
async create(
  oficinaId: number,
  data: {
    veiculoId: number;
    categoria: string;
    descricao: string;
    dataServico: string;
    observacoes?: string | null;
    orcamentoId?: number;
  }
) {
  if (!data.veiculoId) throw new Error("veiculoId é obrigatório.");
  if (!data.categoria?.trim()) throw new Error("categoria é obrigatória.");
  if (!data.descricao?.trim()) throw new Error("descricao é obrigatória.");
  if (!data.dataServico?.trim()) throw new Error("dataServico é obrigatória.");

  // 1) garante veículo da oficina
  const veiculo = await prisma.veiculo.findFirst({
    where: { id: data.veiculoId, oficinaId },
    select: { id: true },
  });
  if (!veiculo) throw new Error("Veículo não encontrado ou não pertence à sua oficina.");

  // 2) se veio orcamentoId, valida
  if (data.orcamentoId !== undefined && data.orcamentoId !== null) {
    const orc = await prisma.orcamento.findFirst({
      where: { id: data.orcamentoId, oficinaId },
      select: { id: true, veiculoId: true },
    });

    if (!orc) throw new Error("Orçamento não encontrado ou não pertence à sua oficina.");

    if (orc.veiculoId !== data.veiculoId) {
      throw new Error("Este orçamento não pertence ao veículo informado.");
    }
  }

  // 3) cria registro
  return prisma.registroTecnico.create({
    data: {
      oficinaId,
      veiculoId: data.veiculoId,
      categoria: data.categoria.trim(),
      descricao: data.descricao.trim(),
      dataServico: new Date(data.dataServico),
      observacoes: data.observacoes?.trim() || null,
      orcamentoId: data.orcamentoId ?? null,
    },
    include: {
      veiculo: { include: { cliente: { select: { id: true, nome: true } } } },
      orcamento: { select: { id: true, numero: true } }, // ✅ útil pra front mostrar link
    },
  });
}

  /**
   * Atualiza registro técnico
   */
  async update(oficinaId: number, id: number, data: UpdateRegistroDTO) {
    // garante que o registro pertence à oficina
    const registro = await prisma.registroTecnico.findFirst({
      where: { id, oficinaId },
      select: { id: true },
    });

    if (!registro) throw new Error("Registro não encontrado ou não pertence à sua oficina.");

    // se trocar veiculoId, valida que o veículo é da oficina
    if (data.veiculoId) {
      const veiculo = await prisma.veiculo.findFirst({
        where: { id: data.veiculoId, oficinaId },
        select: { id: true },
      });

      if (!veiculo) throw new Error("Veículo não encontrado ou não pertence à sua oficina.");
    }

    return prisma.registroTecnico.update({
      where: { id },
      data: {
        veiculoId: data.veiculoId,
        categoria: data.categoria?.trim(),
        descricao: data.descricao?.trim(),
        dataServico: data.dataServico ? new Date(data.dataServico) : undefined,
        observacoes: data.observacoes !== undefined ? (data.observacoes?.trim() || null) : undefined,
      },
      include: {
        veiculo: {
          include: {
            cliente: { select: { id: true, nome: true } },
          },
        },
      },
    });
  }

  /**
   * Remove registro técnico
   */
  async remove(oficinaId: number, id: number) {
    const registro = await prisma.registroTecnico.findFirst({
      where: { id, oficinaId },
      select: { id: true },
    });

    if (!registro) throw new Error("Registro não encontrado ou não pertence à sua oficina.");

    await prisma.registroTecnico.delete({ where: { id } });

    return { message: "Registro técnico removido com sucesso." };
  }
}