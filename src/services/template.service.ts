import { prisma } from "../prisma";

type TemplateItemDTO = {
  descricao: string;
  qtd: number;
  precoUnit: number;
};

type TemplateCreateDTO = {
  nome: string;
  itens: TemplateItemDTO[];
};

const includeItens = { itens: { orderBy: { id: "asc" as const } } } as const;

export class TemplateService {
  async list(oficinaId: number) {
    return prisma.templateServico.findMany({
      where: { oficinaId },
      include: includeItens,
      orderBy: { nome: "asc" },
    });
  }

  async create(oficinaId: number, data: TemplateCreateDTO) {
    if (!data.nome?.trim()) throw new Error("Nome do template é obrigatório.");
    if (!Array.isArray(data.itens) || data.itens.length === 0)
      throw new Error("O template precisa ter pelo menos 1 item.");

    return prisma.templateServico.create({
      data: {
        nome: data.nome.trim(),
        oficinaId,
        itens: {
          create: data.itens.map((it) => ({
            descricao: it.descricao.trim(),
            qtd: it.qtd ?? 1,
            precoUnit: it.precoUnit ?? 0,
          })),
        },
      },
      include: includeItens,
    });
  }

  async update(oficinaId: number, id: number, data: TemplateCreateDTO) {
    const existing = await prisma.templateServico.findFirst({
      where: { id, oficinaId },
    });
    if (!existing) throw new Error("Template não encontrado ou não pertence à sua oficina.");
    if (!data.nome?.trim()) throw new Error("Nome do template é obrigatório.");
    if (!Array.isArray(data.itens) || data.itens.length === 0)
      throw new Error("O template precisa ter pelo menos 1 item.");

    return prisma.$transaction(async (tx) => {
      await tx.templateServicoItem.deleteMany({ where: { templateId: id } });
      return tx.templateServico.update({
        where: { id },
        data: {
          nome: data.nome.trim(),
          itens: {
            create: data.itens.map((it) => ({
              descricao: it.descricao.trim(),
              qtd: it.qtd ?? 1,
              precoUnit: it.precoUnit ?? 0,
            })),
          },
        },
        include: includeItens,
      });
    });
  }

  async delete(oficinaId: number, id: number) {
    const existing = await prisma.templateServico.findFirst({
      where: { id, oficinaId },
    });
    if (!existing) throw new Error("Template não encontrado ou não pertence à sua oficina.");
    await prisma.templateServico.delete({ where: { id } });
    return { message: "Template removido com sucesso." };
  }
}
