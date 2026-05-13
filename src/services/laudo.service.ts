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
   * Cria ou sobrescreve o laudo de entrada de uma OS.
   * Um OS pode ter no máximo 1 laudo.
   * Cada chamada substitui o laudo existente (delete + create).
   */
  async upsert(oficinaId: number, registroTecnicoId: number, data: LaudoCreateDTO) {
    // Valida que a OS pertence à oficina
    const os = await prisma.registroTecnico.findFirst({
      where: { id: registroTecnicoId, oficinaId },
    });
    if (!os) throw new Error("Ordem de Serviço não encontrada ou não pertence à sua oficina.");

    // Remove laudo anterior se existir (cascata apaga as avarias)
    await prisma.laudoEntrada.deleteMany({ where: { registroTecnicoId } });

    // Cria novo laudo
    const laudo = await prisma.laudoEntrada.create({
      data: {
        registroTecnicoId,
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
   * Retorna o laudo de uma OS (ou null se não tiver).
   */
  async get(oficinaId: number, registroTecnicoId: number) {
    const os = await prisma.registroTecnico.findFirst({
      where: { id: registroTecnicoId, oficinaId },
    });
    if (!os) throw new Error("Ordem de Serviço não encontrada.");

    const laudo = await prisma.laudoEntrada.findUnique({
      where: { registroTecnicoId },
      include: { avarias: true },
    });

    return laudo;
  }

  /**
   * Remove o laudo de uma OS.
   */
  async delete(oficinaId: number, registroTecnicoId: number) {
    const os = await prisma.registroTecnico.findFirst({
      where: { id: registroTecnicoId, oficinaId },
    });
    if (!os) throw new Error("Ordem de Serviço não encontrada.");

    await prisma.laudoEntrada.deleteMany({ where: { registroTecnicoId } });
    return { message: "Laudo removido." };
  }
}
