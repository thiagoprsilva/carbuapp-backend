import { prisma } from "../prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class AuthService {
  /**
   * Login unificado:
   * - Com officinaId  → usuário normal (admin / mecânico)
   * - Sem officinaId  → tenta login como SUPERADMIN
   */
  async login(email: string, senha: string, oficinaId?: number) {
    let user: any;

    if (oficinaId !== undefined && oficinaId !== null) {
      // Fluxo normal: busca dentro da oficina informada
      user = await prisma.usuario.findFirst({
        where: { email, oficinaId, ativo: true },
        include: { oficina: true },
      });

      if (!user) {
        throw new Error("Usuário não encontrado para esta oficina");
      }
    } else {
      // Fluxo superadmin: busca por email, sem filtro de oficina
      user = await prisma.usuario.findFirst({
        where: { email, role: "SUPERADMIN", ativo: true },
      });

      if (!user) {
        throw new Error("Credenciais inválidas");
      }
    }

    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      throw new Error("Senha inválida");
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        oficinaId: user.oficinaId ?? null,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    // Superadmin não tem oficina vinculada
    if (user.role === "SUPERADMIN") {
      return {
        token,
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          role: user.role,
          oficinaId: null,
        },
        oficina: null,
      };
    }

    // Admin / Mecânico
    return {
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        oficinaId: user.oficinaId,
      },
      oficina: {
        id: user.oficina.id,
        nome: user.oficina.nome,
        responsavel: user.oficina.responsavel,
        logoUrl: user.oficina.logoUrl ?? null,
      },
    };
  }

  /**
   * Retorna dados do usuário autenticado (GET /auth/me)
   */
  async me(userId: number) {
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        oficinaId: true,
        ativo: true,
        oficina: {
          select: {
            id: true,
            nome: true,
            responsavel: true,
            logoUrl: true,
          },
        },
      },
    });

    if (!user || !user.ativo) {
      throw new Error("Usuário inválido ou desativado");
    }

    return user;
  }

  /**
   * Altera a própria senha (qualquer role)
   */
  async alterarSenha(userId: number, senhaAtual: string, novaSenha: string) {
    const user = await prisma.usuario.findUnique({ where: { id: userId } });
    if (!user) throw new Error("Usuário não encontrado");

    const senhaValida = await bcrypt.compare(senhaAtual, user.senha);
    if (!senhaValida) throw new Error("Senha atual incorreta");

    const novoHash = await bcrypt.hash(novaSenha, 12);
    await prisma.usuario.update({
      where: { id: userId },
      data: { senha: novoHash },
    });
  }
}
