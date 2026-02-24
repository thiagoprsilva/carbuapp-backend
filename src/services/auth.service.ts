// Importa o Prisma para acessar o banco
import { prisma } from "../prisma";

// Importa bcrypt para comparar senha criptografada
import bcrypt from "bcrypt";

// Importa jwt para gerar o token
import jwt from "jsonwebtoken";

export class AuthService {
  /**
   * Método responsável por autenticar o usuário
   * Recebe email e senha
   * Retorna token + dados do usuário
   */
  async login(email: string, senha: string) {

    // Busca o usuário pelo email no banco
    const user = await prisma.usuario.findUnique({
      where: { email },
    });

    // Se não existir usuário, lança erro
    if (!user) {
      throw new Error("Usuário não encontrado");
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

    // Retorna token + dados básicos do usuário
    return {
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
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