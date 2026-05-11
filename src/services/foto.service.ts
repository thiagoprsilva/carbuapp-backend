import { prisma } from "../prisma";
import fs from "fs";
import path from "path";

export class FotoService {
  async upload(
    oficinaId: number,
    orcamentoId: number,
    fileRelativePath: string,
    descricao?: string,
    zona?: string
  ) {
    const orcamento = await prisma.orcamento.findFirst({
      where: { id: orcamentoId, oficinaId },
    });
    if (!orcamento) throw new Error("Orçamento não encontrado ou não pertence à sua oficina.");

    const foto = await prisma.foto.create({
      data: {
        orcamentoId,
        url: fileRelativePath,
        descricao: descricao ?? null,
        zona: zona ?? null,
      },
    });

    return foto;
  }

  async list(oficinaId: number, orcamentoId: number) {
    const orcamento = await prisma.orcamento.findFirst({
      where: { id: orcamentoId, oficinaId },
    });
    if (!orcamento) throw new Error("Orçamento não encontrado.");

    return prisma.foto.findMany({
      where: { orcamentoId },
      orderBy: { criadoEm: "desc" },
    });
  }

  async delete(oficinaId: number, orcamentoId: number, fotoId: number) {
    const orcamento = await prisma.orcamento.findFirst({
      where: { id: orcamentoId, oficinaId },
    });
    if (!orcamento) throw new Error("Orçamento não encontrado.");

    const foto = await prisma.foto.findFirst({
      where: { id: fotoId, orcamentoId },
    });
    if (!foto) throw new Error("Foto não encontrada.");

    // Remove arquivo físico
    const fullPath = path.resolve("uploads", foto.url);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    await prisma.foto.delete({ where: { id: fotoId } });
    return { message: "Foto removida." };
  }
}
