import { prisma } from "../prisma";

export const STATUS_VALIDOS = ["Pendente", "Aprovado", "Rejeitado", "Executado"] as const;
export type OrcamentoStatus = typeof STATUS_VALIDOS[number];

type OrcamentoItemDTO = {
  descricao: string;
  qtd: number;
  precoUnit?: number;
};

type OrcamentoCreateDTO = {
  registroTecnicoId: number; // obrigatório — orçamento sempre pertence a uma OS
  itens: OrcamentoItemDTO[];
};

export class OrcamentoService {
  /**
   * Cria orçamento vinculado a uma OS.
   * O veiculoId é derivado automaticamente da OS — sem necessidade de informá-lo.
   */
  async create(oficinaId: number, data: OrcamentoCreateDTO) {
    // 1) Valida a OS e obtém o veiculoId
    const os = await prisma.registroTecnico.findFirst({
      where: { id: data.registroTecnicoId, oficinaId },
      select: { id: true, veiculoId: true },
    });
    if (!os) {
      throw new Error("Ordem de Serviço não encontrada ou não pertence à sua oficina.");
    }

    // 2) Próximo número do orçamento (por oficina)
    const ultimo = await prisma.orcamento.findFirst({
      where: { oficinaId },
      orderBy: { numero: "desc" },
      select: { numero: true },
    });
    const proximoNumero = ultimo ? ultimo.numero + 1 : 1;

    // 3) Calcula itens
    const itensCalculados = data.itens.map((item) => {
      const qtd = item.qtd ?? 1;
      const preco = item.precoUnit ?? 0;
      const valorLinha = qtd * preco;
      return { descricao: item.descricao, qtd, precoUnit: preco, valorLinha };
    });

    const subtotal = itensCalculados.reduce((acc, i) => acc + (i.valorLinha ?? 0), 0);
    const total = subtotal;

    // 4) Cria orçamento + itens em transação
    const orcamento = await prisma.orcamento.create({
      data: {
        numero: proximoNumero,
        subtotal,
        total,
        veiculoId: os.veiculoId,
        oficinaId,
        registroTecnicoId: data.registroTecnicoId,
        itens: {
          create: itensCalculados,
        },
      },
      include: {
        itens: true,
        veiculo: {
          include: {
            cliente: { select: { id: true, nome: true, telefone: true } },
          },
        },
        registroTecnico: { select: { id: true, numero: true, status: true } },
      },
    });

    return orcamento;
  }

  /**
   * Retorna um orçamento pelo ID.
   */
  async getById(oficinaId: number, orcamentoId: number) {
    const orcamento = await prisma.orcamento.findFirst({
      where: { id: orcamentoId, oficinaId },
      include: {
        itens: true,
        veiculo: {
          include: {
            cliente: { select: { id: true, nome: true, telefone: true } },
          },
        },
        registroTecnico: { select: { id: true, numero: true, status: true } },
      },
    });
    if (!orcamento) {
      throw new Error("Orçamento não encontrado ou não pertence à sua oficina.");
    }
    return orcamento;
  }

  /**
   * Lista orçamentos da oficina.
   * Pode filtrar por veiculoId, registroTecnicoId e/ou status.
   */
  async list(
    oficinaId: number,
    veiculoId?: number,
    status?: string,
    registroTecnicoId?: number
  ) {
    const where: any = { oficinaId };
    if (veiculoId) where.veiculoId = veiculoId;
    if (registroTecnicoId) where.registroTecnicoId = registroTecnicoId;
    if (status && STATUS_VALIDOS.includes(status as OrcamentoStatus)) {
      where.status = status;
    }

    return prisma.orcamento.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        itens: true,
        veiculo: {
          include: {
            cliente: { select: { id: true, nome: true, telefone: true } },
          },
        },
        registroTecnico: { select: { id: true, numero: true, status: true } },
      },
    });
  }

  /**
   * Atualiza apenas o status do orçamento.
   */
  async updateStatus(oficinaId: number, orcamentoId: number, status: string) {
    if (!STATUS_VALIDOS.includes(status as OrcamentoStatus)) {
      throw new Error(`Status inválido. Valores aceitos: ${STATUS_VALIDOS.join(", ")}.`);
    }

    const orcamento = await prisma.orcamento.findFirst({
      where: { id: orcamentoId, oficinaId },
    });
    if (!orcamento) {
      throw new Error("Orçamento não encontrado ou não pertence à sua oficina.");
    }

    return prisma.orcamento.update({
      where: { id: orcamentoId },
      data: { status },
      include: {
        itens: true,
        veiculo: { include: { cliente: true } },
        registroTecnico: { select: { id: true, numero: true, status: true } },
      },
    });
  }

  /**
   * Atualiza itens do orçamento (substitui todos).
   * Não permite trocar a OS pai.
   */
  async update(
    oficinaId: number,
    orcamentoId: number,
    data: { itens?: OrcamentoItemDTO[]; status?: string }
  ) {
    const orcamento = await prisma.orcamento.findFirst({
      where: { id: orcamentoId, oficinaId },
      include: { itens: true },
    });
    if (!orcamento) {
      throw new Error("Orçamento não encontrado ou não pertence à sua oficina.");
    }

    let itensCreate:
      | { descricao: string; qtd: number; precoUnit: number; valorLinha: number }[]
      | undefined;
    let subtotal: number | undefined;
    let total: number | undefined;

    if (data.itens !== undefined) {
      if (!Array.isArray(data.itens) || data.itens.length === 0) {
        throw new Error("itens deve ser um array com pelo menos 1 item.");
      }

      itensCreate = data.itens.map((item) => {
        const qtd = item.qtd ?? 1;
        const preco = item.precoUnit ?? 0;
        return { descricao: item.descricao, qtd, precoUnit: preco, valorLinha: qtd * preco };
      });
      subtotal = itensCreate.reduce((acc, i) => acc + i.valorLinha, 0);
      total = subtotal;
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (data.itens !== undefined) {
        await tx.orcamentoItem.deleteMany({ where: { orcamentoId } });
        await tx.orcamentoItem.createMany({
          data: itensCreate!.map((i) => ({ ...i, orcamentoId })),
        });
      }

      return tx.orcamento.update({
        where: { id: orcamentoId },
        data: {
          ...(subtotal !== undefined ? { subtotal } : {}),
          ...(total !== undefined ? { total } : {}),
          ...(data.status !== undefined ? { status: data.status } : {}),
        },
        include: {
          itens: true,
          veiculo: { include: { cliente: true } },
          registroTecnico: { select: { id: true, numero: true, status: true } },
        },
      });
    });

    return updated;
  }

  /**
   * Deleta orçamento e seus itens.
   */
  async delete(oficinaId: number, orcamentoId: number) {
    const orcamento = await prisma.orcamento.findFirst({
      where: { id: orcamentoId, oficinaId },
    });
    if (!orcamento) {
      throw new Error("Orçamento não encontrado ou não pertence à sua oficina.");
    }

    await prisma.$transaction(async (tx) => {
      await tx.orcamentoItem.deleteMany({ where: { orcamentoId } });
      await tx.orcamento.delete({ where: { id: orcamentoId } });
    });

    return { message: "Orçamento removido com sucesso." };
  }
}
