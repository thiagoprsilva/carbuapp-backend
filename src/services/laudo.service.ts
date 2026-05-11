import { prisma } from "../prisma";

export const NIVEIS_COMBUST = ["1/4", "1/2", "3/4", "cheio"] as const;
export const SEVERIDADES = ["leve", "moderado", "grave"] as const;

export type AvariaDTO = {
  zona: string;
  severidade?: string;
  observacao?: string;
};

export type LaudoCreateDTO = {
  km?: number;
  nivelCombust?: string;
  observacoes?: string;
  avarias?: AvariaDTO[];
};

export class LaudoService {
  /**
   * Cria ou sobrescreve o laudo de entrada de um orçamento.
   * Regra: um orçamento pode ter no máximo 1 laudo.
   * A cada chamada substitui o laudo existente (delete + create) — imutabilidade controlada.
   */
  async upsert(oficinaId: number, orcamentoId: number, data: LaudoCreateDTO) {
    // 1) Valida que o orçamento pertence à oficina
    const orcamento = await prisma.orcamento.findFirst({
      where: { id: orcamentoId, oficinaId },
    });
    if (!orcamento) throw new Error("Orçamento não encontrado ou não pertence à sua oficina.");

    // 2) Remove laudo anterior se existir (cascata apaga as avarias)
    await prisma.laudoEntrada.deleteMany({ where: { orcamentoId } });

    // 3) Cria novo laudo
    const laudo = await prisma.laudoEntrada.create({
      data: {
        orcamentoId,
        km: data.km ?? null,
        nivelCombust: data.nivelCombust ?? null,
        observacoes: data.observacoes ?? null,
        avarias: {
          create: (data.avarias ?? []).map((a) => ({
            zona: a.zona,
            severidade: a.severidade ?? null,
            observacao: a.observacao ?? null,
          })),
        },
      },
      include: { avarias: true },
    });

    return laudo;
  }

  /**
   * Retorna o laudo de um orçamento (ou null se não tiver).
   */
  async get(oficinaId: number, orcamentoId: number) {
    const orcamento = await prisma.orcamento.findFirst({
      where: { id: orcamentoId, oficinaId },
    });
    if (!orcamento) throw new Error("Orçamento não encontrado.");

    const laudo = await prisma.laudoEntrada.findUnique({
      where: { orcamentoId },
      include: { avarias: true },
    });

    return laudo;
  }

  /**
   * Remove o laudo de um orçamento.
   */
  async delete(oficinaId: number, orcamentoId: number) {
    const orcamento = await prisma.orcamento.findFirst({
      where: { id: orcamentoId, oficinaId },
    });
    if (!orcamento) throw new Error("Orçamento não encontrado.");

    await prisma.laudoEntrada.deleteMany({ where: { orcamentoId } });
    return { message: "Laudo removido." };
  }
}
