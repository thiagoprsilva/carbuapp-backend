import path from "path";
import fs from "fs";
import { prisma } from "../prisma";

export class OficinaService {
  // ─── SUPERADMIN: listar todas ───────────────────────────────────────────────
  async listarTodas() {
    return prisma.oficina.findMany({
      orderBy: { nome: "asc" },
      include: {
        _count: { select: { usuarios: true, clientes: true } },
      },
    });
  }

  // ─── SUPERADMIN: buscar uma ─────────────────────────────────────────────────
  async buscarPorId(id: number) {
    const oficina = await prisma.oficina.findUnique({
      where: { id },
      include: {
        _count: { select: { usuarios: true, clientes: true, veiculos: true, orcamentos: true } },
      },
    });
    if (!oficina) throw new Error("Oficina não encontrada.");
    return oficina;
  }

  // ─── SUPERADMIN: criar nova ──────────────────────────────────────────────────
  async criar(dados: {
    nome: string;
    responsavel: string;
    telefone: string;
    endereco: string;
  }) {
    if (!dados.nome || !dados.responsavel || !dados.telefone || !dados.endereco) {
      throw new Error("nome, responsavel, telefone e endereco são obrigatórios.");
    }
    return prisma.oficina.create({ data: dados });
  }

  // ─── SUPERADMIN / ADMIN: atualizar dados ────────────────────────────────────
  async atualizar(
    id: number,
    dados: Partial<{ nome: string; responsavel: string; telefone: string; endereco: string }>
  ) {
    await this.buscarPorId(id); // valida existência
    return prisma.oficina.update({ where: { id }, data: dados });
  }

  // ─── ADMIN / SUPERADMIN: upload de logo ─────────────────────────────────────
  async salvarLogo(oficinaId: number, file: Express.Multer.File) {
    await this.buscarPorId(oficinaId); // valida existência

    // Remove logo antiga se existir
    const oficina = await prisma.oficina.findUnique({ where: { id: oficinaId } });
    if (oficina?.logoUrl) {
      const logoAntiga = path.join("uploads", oficina.logoUrl);
      if (fs.existsSync(logoAntiga)) fs.unlinkSync(logoAntiga);
    }

    // Salva o novo caminho relativo (ex: "logos/oficina-1.png")
    const logoUrl = `logos/${file.filename}`;
    return prisma.oficina.update({ where: { id: oficinaId }, data: { logoUrl } });
  }

  // ─── ADMIN / SUPERADMIN: remover logo ───────────────────────────────────────
  async removerLogo(oficinaId: number) {
    const oficina = await prisma.oficina.findUnique({ where: { id: oficinaId } });
    if (!oficina) throw new Error("Oficina não encontrada.");

    if (oficina.logoUrl) {
      const caminho = path.join("uploads", oficina.logoUrl);
      if (fs.existsSync(caminho)) fs.unlinkSync(caminho);
    }

    return prisma.oficina.update({ where: { id: oficinaId }, data: { logoUrl: null } });
  }
}
