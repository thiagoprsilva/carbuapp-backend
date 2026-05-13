import { prisma } from "../prisma";
import fs from "fs";
import path from "path";

export class FotoService {
  async upload(
    oficinaId: number,
    registroTecnicoId: number,
    fileRelativePath: string,
    descricao?: string,
    zona?: string
  ) {
    const os = await prisma.registroTecnico.findFirst({
      where: { id: registroTecnicoId, oficinaId },
    });
    if (!os) throw new Error("Ordem de Serviço não encontrada ou não pertence à sua oficina.");

    const foto = await prisma.foto.create({
      data: {
        registroTecnicoId,
        url: fileRelativePath,
        descricao: descricao ?? null,
        zona: zona ?? null,
      },
    });

    return foto;
  }

  async list(oficinaId: number, registroTecnicoId: number) {
    const os = await prisma.registroTecnico.findFirst({
      where: { id: registroTecnicoId, oficinaId },
    });
    if (!os) throw new Error("Ordem de Serviço não encontrada.");

    return prisma.foto.findMany({
      where: { registroTecnicoId },
      orderBy: { criadoEm: "desc" },
    });
  }

  async delete(oficinaId: number, registroTecnicoId: number, fotoId: number) {
    const os = await prisma.registroTecnico.findFirst({
      where: { id: registroTecnicoId, oficinaId },
    });
    if (!os) throw new Error("Ordem de Serviço não encontrada.");

    const foto = await prisma.foto.findFirst({
      where: { id: fotoId, registroTecnicoId },
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
