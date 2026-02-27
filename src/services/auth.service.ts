// Importa o Prisma para acessar o banco
import { prisma } from "../prisma";

// Importa bcrypt para comparar senha criptografada
import bcrypt from "bcrypt";

// Importa jwt para gerar o token
import jwt from "jsonwebtoken";

export class AuthService {
  /**
   * Método responsável por autenticar o usuário
   * Recebe email, senha e oficinaId (multi-oficina)
   * Retorna token + dados do usuário + dados básicos da oficina
   */
  async login(email: string, senha: string, oficinaId: number) {
    // Busca o usuário pelo email + oficinaId (e ativo)
    // Isso garante que o mesmo email (se existir em outra oficina) não conflita
    const user = await prisma.usuario.findFirst({
      where: {
        email,
        oficinaId,
        ativo: true,
      },
      include: {
        oficina: true, // traz dados da oficina (útil no front)
      },
    });

    // Se não existir usuário, lança erro
    if (!user) {
      throw new Error("Usuário não encontrado para esta oficina");
    }

    // Compara senha digitada com a senha criptografada do banco
    const senhaValida = await bcrypt.compare(senha, user.senha);

    // Se senha não bater, erro
    if (!senhaValida) {
      throw new Error("Senha inválida");
    }

    /**
     * Geração do JWT
     * Payload contém apenas dados necessários
     * Nunca colocamos senha no token
     */
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        oficinaId: user.oficinaId,
      },
      process.env.JWT_SECRET as string, // segredo usado para assinar
      {
        expiresIn: "1d", // token expira em 1 dia
      }
    );

    // Retorna token + dados básicos do usuário + oficina
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
      },
    };
  }

  /**
   * Retorna dados do usuário autenticado.
   * Recebe o "id" já vindo do token (req.user)
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
      },
    });

    if (!user || !user.ativo) {
      throw new Error("Usuário inválido ou desativado");
    }

    return user;
  }
}