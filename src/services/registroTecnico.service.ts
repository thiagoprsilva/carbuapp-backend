import { prisma } from "../prisma";
import { LaudoCreateDTO } from "./laudo.service";

export const STATUS_OS = [
  "Aberta",
  "Em andamento",
  "Aguardando peças",
  "Concluída",
  "Cancelada",
] as const;
export type StatusOS = typeof STATUS_OS[number];

type CreateOSDTO = {
  veiculoId: number;
  categoria: string;
  descricao: string;
  dataServico: string; // "YYYY-MM-DD"
  observacoes?: string | null;
  laudo?: LaudoCreateDTO; // opcional — criado na mesma transação
};

type UpdateOSDTO = {
  categoria?: string;
  descricao?: string;
  dataServico?: string;
  observacoes?: string | null;
};

// ─── include padrão para listagem ────────────────────────────────────────────
const includeList = {
  veiculo: {
    include: {
      cliente: { select: { id: true, nome: true } },
    },
  },
} as const;

// ─── include completo para detalhe ───────────────────────────────────────────
const includeDetail = {
  veiculo: {
    include: {
      cliente: { select: { id: true, nome: true, telefone: true } },
    },
  },
  laudo: { include: { avarias: true } },
  fotos: { orderBy: { criadoEm: "desc" as const } },
  orcamentos: {
    orderBy: { createdAt: "desc" as const },
    include: {
      itens: true,
    },
  },
} as const;

export class RegistroTecnicoService {
  // ─── Listagem ──────────────────────────────────────────────────────────────

  async list(oficinaId: number, veiculoId?: number, limit?: number) {
    return prisma.registroTecnico.findMany({
      where: {
        oficinaId,
        ...(veiculoId ? { veiculoId } : {}),
      },
      include: includeList,
      orderBy: { createdAt: "desc" },
      ...(limit ? { take: limit } : {}),
    });
  }

  // ─── Detalhe de uma OS ─────────────────────────────────────────────────────

  async getById(oficinaId: number, id: number) {
    const os = await prisma.registroTecnico.findFirst({
      where: { id, oficinaId },
      include: includeDetail,
    });
    if (!os) throw new Error("Ordem de Serviço não encontrada ou não pertence à sua oficina.");
    return os;
  }

  // ─── Criação ───────────────────────────────────────────────────────────────

  async create(oficinaId: number, data: CreateOSDTO) {
    if (!data.veiculoId) throw new Error("veiculoId é obrigatório.");
    if (!data.categoria?.trim()) throw new Error("categoria é obrigatória.");
    if (!data.descricao?.trim()) throw new Error("descricao é obrigatória.");
    if (!data.dataServico?.trim()) throw new Error("dataServico é obrigatória.");

    // Valida veículo da oficina
    const veiculo = await prisma.veiculo.findFirst({
      where: { id: data.veiculoId, oficinaId },
      select: { id: true },
    });
    if (!veiculo) throw new Error("Veículo não encontrado ou não pertence à sua oficina.");

    // Próximo número de OS para esta oficina
    const ultimo = await prisma.registroTecnico.findFirst({
      where: { oficinaId },
      orderBy: { numero: "desc" },
      select: { numero: true },
    });
    const proximoNumero = ultimo ? ultimo.numero + 1 : 1;

    // Cria a OS (e o laudo opcionalmente) em transação
    const os = await prisma.$transaction(async (tx) => {
      const criada = await tx.registroTecnico.create({
        data: {
          numero: proximoNumero,
          status: "Aberta",
          oficina: { connect: { id: oficinaId } },
          veiculo: { connect: { id: data.veiculoId } },
          categoria: data.categoria.trim(),
          descricao: data.descricao.trim(),
          dataServico: new Date(data.dataServico),
          observacoes: data.observacoes?.trim() || null,
        },
        include: includeDetail,
      });

      // Se veio laudo, cria junto
      if (data.laudo) {
        await tx.laudoEntrada.create({
          data: {
            registroTecnicoId: criada.id,
            km: data.laudo.km ?? null,
            nivelCombust: data.laudo.nivelCombust ?? null,
            observacoes: data.laudo.observacoes ?? null,
            avarias: {
              create: (data.laudo.avarias ?? []).map((a) => ({
                zona: a.zona,
                severidade: a.severidade ?? null,
                observacao: a.observacao ?? null,
              })),
            },
          },
        });
      }

      // Retorna com dados atualizados (inclui laudo se foi criado)
      return tx.registroTecnico.findUniqueOrThrow({
        where: { id: criada.id },
        include: includeDetail,
      });
    });

    return os;
  }

  // ─── Atualização de campos descritivos ─────────────────────────────────────

  async update(oficinaId: number, id: number, data: UpdateOSDTO) {
    const os = await prisma.registroTecnico.findFirst({
      where: { id, oficinaId },
      select: { id: true },
    });
    if (!os) throw new Error("Ordem de Serviço não encontrada ou não pertence à sua oficina.");

    return prisma.registroTecnico.update({
      where: { id },
      data: {
        categoria: data.categoria?.trim(),
        descricao: data.descricao?.trim(),
        dataServico: data.dataServico ? new Date(data.dataServico) : undefined,
        observacoes: data.observacoes !== undefined ? (data.observacoes?.trim() || null) : undefined,
      },
      include: includeList,
    });
  }

  // ─── Atualização de status ─────────────────────────────────────────────────

  async updateStatus(oficinaId: number, id: number, status: string) {
    if (!STATUS_OS.includes(status as StatusOS)) {
      throw new Error(`Status inválido. Valores aceitos: ${STATUS_OS.join(", ")}.`);
    }

    const os = await prisma.registroTecnico.findFirst({
      where: { id, oficinaId },
      select: { id: true },
    });
    if (!os) throw new Error("Ordem de Serviço não encontrada ou não pertence à sua oficina.");

    return prisma.registroTecnico.update({
      where: { id },
      data: { status },
      include: includeDetail,
    });
  }

  // ─── Remoção ───────────────────────────────────────────────────────────────

  async remove(oficinaId: number, id: number) {
    const os = await prisma.registroTecnico.findFirst({
      where: { id, oficinaId },
      select: { id: true },
    });
    if (!os) throw new Error("Ordem de Serviço não encontrada ou não pertence à sua oficina.");

    await prisma.registroTecnico.delete({ where: { id } });
    return { message: "Ordem de Serviço removida com sucesso." };
  }
}
