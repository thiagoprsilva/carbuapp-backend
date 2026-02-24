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
}