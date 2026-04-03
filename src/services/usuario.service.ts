import { prisma } from "../prisma";
import bcrypt from "bcrypt";

export class UsuarioService {
  // ─── Listar usuários ─────────────────────────────────────────────────────────
  // ADMIN: só da própria oficina
  // SUPERADMIN: por oficinaId informado (ou todos se omitido)
  async listar(role: string, oficinaIdToken: number | null, filtroOficinaId?: number) {
    if (role === "SUPERADMIN") {
      const where = filtroOficinaId ? { oficinaId: filtroOficinaId } : {};
      return prisma.usuario.findMany({
        where,
        orderBy: { nome: "asc" },
        select: {
          id: true, nome: true, email: true, role: true,
          ativo: true, createdAt: true, oficinaId: true,
          oficina: { select: { id: true, nome: true } },
        },
      });
    }

    // ADMIN
    return prisma.usuario.findMany({
      where: { oficinaId: oficinaIdToken! },
      orderBy: { nome: "asc" },
      select: {
        id: true, nome: true, email: true, role: true,
        ativo: true, createdAt: true, oficinaId: true,
      },
    });
  }

  // ─── Criar usuário ───────────────────────────────────────────────────────────
  async criar(
    roleToken: string,
    oficinaIdToken: number | null,
    dados: { nome: string; email: string; senha: string; role: string; oficinaId?: number }
  ) {
    const { nome, email, senha, role, oficinaId } = dados;

    if (!nome || !email || !senha || !role) {
      throw new Error("nome, email, senha e role são obrigatórios.");
    }

    // Roles válidos para criar
    const rolesPermitidos = ["ADMIN", "MECANICO"];
    if (!rolesPermitidos.includes(role.toUpperCase())) {
      throw new Error("Role inválido. Use ADMIN ou MECANICO.");
    }

    // Determina a oficina correta
    let targetOficinaId: number;
    if (roleToken === "SUPERADMIN") {
      if (!oficinaId) throw new Error("oficinaId é obrigatório para o superadmin.");
      targetOficinaId = oficinaId;
    } else {
      targetOficinaId = oficinaIdToken!;
    }

    const emailExiste = await prisma.usuario.findUnique({ where: { email } });
    if (emailExiste) throw new Error("Este e-mail já está em uso.");

    const hash = await bcrypt.hash(senha, 12);

    return prisma.usuario.create({
      data: {
        nome,
        email,
        senha: hash,
        role: role.toUpperCase(),
        ativo: true,
        oficinaId: targetOficinaId,
      },
      select: {
        id: true, nome: true, email: true, role: true,
        ativo: true, createdAt: true, oficinaId: true,
      },
    });
  }

  // ─── Atualizar usuário ───────────────────────────────────────────────────────
  async atualizar(
    roleToken: string,
    oficinaIdToken: number | null,
    usuarioId: number,
    dados: Partial<{ nome: string; role: string; ativo: boolean }>
  ) {
    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (!usuario) throw new Error("Usuário não encontrado.");

    // ADMIN só pode editar usuários da própria oficina
    if (roleToken === "ADMIN" && usuario.oficinaId !== oficinaIdToken) {
      throw new Error("Acesso negado.");
    }

    // Ninguém pode promover alguém a SUPERADMIN via esta rota
    if (dados.role && dados.role.toUpperCase() === "SUPERADMIN") {
      throw new Error("Não é possível atribuir o role SUPERADMIN.");
    }

    return prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        ...(dados.nome && { nome: dados.nome }),
        ...(dados.role && { role: dados.role.toUpperCase() }),
        ...(dados.ativo !== undefined && { ativo: dados.ativo }),
      },
      select: {
        id: true, nome: true, email: true, role: true,
        ativo: true, createdAt: true, oficinaId: true,
      },
    });
  }

  // ─── Redefinir senha (admin define nova senha para o usuário) ────────────────
  async redefinirSenha(
    roleToken: string,
    oficinaIdToken: number | null,
    usuarioId: number,
    novaSenha: string
  ) {
    if (!novaSenha || novaSenha.length < 6) {
      throw new Error("A nova senha deve ter pelo menos 6 caracteres.");
    }

    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (!usuario) throw new Error("Usuário não encontrado.");

    // ADMIN só pode redefinir senha de usuários da própria oficina
    if (roleToken === "ADMIN" && usuario.oficinaId !== oficinaIdToken) {
      throw new Error("Acesso negado.");
    }

    // Ninguém pode redefinir senha do SUPERADMIN por esta rota (usa /auth/senha)
    if (usuario.role === "SUPERADMIN" && roleToken !== "SUPERADMIN") {
      throw new Error("Acesso negado.");
    }

    const hash = await bcrypt.hash(novaSenha, 12);
    await prisma.usuario.update({ where: { id: usuarioId }, data: { senha: hash } });
  }
}
