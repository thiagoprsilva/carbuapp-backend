import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

const authService = new AuthService();

export class AuthController {
  /**
   * POST /auth/login
   * Apenas email + senha — o backend identifica a oficina automaticamente.
   */
  async login(req: Request, res: Response) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({ message: "email e senha são obrigatórios." });
      }

      const result = await authService.login(email, senha);
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  /**
   * GET /auth/me
   */
  async me(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: "Não autenticado" });
      const user = await authService.me(req.user.id);
      return res.json(user);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  /**
   * PATCH /auth/senha
   * Qualquer usuário autenticado pode alterar a própria senha
   */
  async alterarSenha(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: "Não autenticado" });

      const { senhaAtual, novaSenha } = req.body;
      if (!senhaAtual || !novaSenha) {
        return res.status(400).json({ message: "senhaAtual e novaSenha são obrigatórios." });
      }
      if (novaSenha.length < 6) {
        return res.status(400).json({ message: "Nova senha deve ter pelo menos 6 caracteres." });
      }

      await authService.alterarSenha(req.user.id, senhaAtual, novaSenha);
      return res.json({ message: "Senha alterada com sucesso." });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}
