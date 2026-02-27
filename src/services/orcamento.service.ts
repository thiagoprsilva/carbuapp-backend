import { prisma } from "../prisma";

type OrcamentoItemDTO = {
  descricao: string;
  qtd: number;
  precoUnit?: number; // pode ser opcional no MVP
};

type OrcamentoCreateDTO = {
  veiculoId: number;
  itens: OrcamentoItemDTO[];
};

export class OrcamentoService {
  /**
   * Cria orçamento com número sequencial por oficina.
   * Regras:
   * - veiculo deve ser da oficina
   * - numero deve ser o próximo (max + 1)
   * - calcula subtotal/total
   */
  async create(oficinaId: number, data: OrcamentoCreateDTO) {
    // 1) Valida veículo por oficina (segurança)
    const veiculo = await prisma.veiculo.findFirst({
      where: { id: data.veiculoId, oficinaId },
    });

    if (!veiculo) {
      throw new Error("Veículo não encontrado ou não pertence à sua oficina.");
    }

    // 2) Descobre o próximo número do orçamento (por oficina)
    const ultimo = await prisma.orcamento.findFirst({
      where: { oficinaId },
      orderBy: { numero: "desc" },
      select: { numero: true },
    });

    const proximoNumero = ultimo ? ultimo.numero + 1 : 0; // começa do 0

    // 3) Calcula subtotal/total com base nos itens
    const itensCalculados = data.itens.map((item) => {
      const qtd = item.qtd ?? 1;
      const preco = item.precoUnit ?? 0;
      const valorLinha = qtd * preco;

      return {
        descricao: item.descricao,
        qtd,
        precoUnit: preco,
        valorLinha,
      };
    });

    const subtotal = itensCalculados.reduce((acc, i) => acc + (i.valorLinha ?? 0), 0);
    const total = subtotal; // no MVP sem desconto/serviço extra (pode evoluir depois)

    // 4) Cria orçamento + itens em uma transação (tudo ou nada)
    const orcamento = await prisma.orcamento.create({
      data: {
        numero: proximoNumero,
        subtotal,
        total,
        veiculoId: data.veiculoId,
        oficinaId,
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
      },
    });

    return orcamento;
  }

  /**
   * Lista orçamentos da oficina.
   * Pode filtrar por veiculoId.
   */
  async list(oficinaId: number, veiculoId?: number) {
    const whereClause: any = { oficinaId };
    if (veiculoId) whereClause.veiculoId = veiculoId;

    const orcamentos = await prisma.orcamento.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        itens: true,
        veiculo: {
          include: {
            cliente: { select: { id: true, nome: true, telefone: true } },
          },
        },
      },
    });
    

    return orcamentos;
  }

  /**
   * Atualiza orçamento:
   * - valida que orçamento é da oficina
   * - permite atualizar veiculoId (validando oficina)
   * - substitui itens (estratégia simples e robusta para MVP)
   * - recalcula subtotal/total no backend
   */
  async update(
    oficinaId: number,
    orcamentoId: number,
    data: { veiculoId?: number; itens?: OrcamentoItemDTO[] }
  ) {
    // 1) Confere se o orçamento existe e é da oficina
    const orcamento = await prisma.orcamento.findFirst({
      where: { id: orcamentoId, oficinaId },
      include: { itens: true },
    });

    if (!orcamento) {
      throw new Error("Orçamento não encontrado ou não pertence à sua oficina.");
    }

    // 2) Se trocar veiculoId, valida se o veículo é da oficina
    if (data.veiculoId !== undefined) {
      const veiculo = await prisma.veiculo.findFirst({
        where: { id: data.veiculoId, oficinaId },
      });

      if (!veiculo) {
        throw new Error("Veículo informado não existe ou não pertence à sua oficina.");
      }
    }

    // 3) Se vier itens, vamos substituir todos (MVP simples e confiável)
    //    (Depois refinamos para update parcial por item, se quiser)
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
        const valorLinha = qtd * preco;

        return {
          descricao: item.descricao,
          qtd,
          precoUnit: preco,
          valorLinha,
        };
      });

      subtotal = itensCreate.reduce((acc, i) => acc + i.valorLinha, 0);
      total = subtotal;
    }

    // 4) Transação: deleta itens antigos (se veio itens novos), cria novos, atualiza orçamento
    const updated = await prisma.$transaction(async (tx) => {
      if (data.itens !== undefined) {
        // remove itens antigos
        await tx.orcamentoItem.deleteMany({ where: { orcamentoId } });

        // recria itens
        await tx.orcamentoItem.createMany({
          data: itensCreate!.map((i) => ({ ...i, orcamentoId })),
        });
      }

      // atualiza cabeçalho do orçamento
      const orc = await tx.orcamento.update({
        where: { id: orcamentoId },
        data: {
          ...(data.veiculoId !== undefined ? { veiculoId: data.veiculoId } : {}),
          ...(subtotal !== undefined ? { subtotal } : {}),
          ...(total !== undefined ? { total } : {}),
        },
        include: {
          itens: true,
          veiculo: { include: { cliente: true } },
        },
      });

      return orc;
    });

    return updated;
  }

  /**
   * Deleta orçamento e seus itens (na ordem correta).
   * Regra: precisa ser da mesma oficina.
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