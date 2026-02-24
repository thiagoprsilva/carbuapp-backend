// Tipos do Express
import { Request, Response } from "express";

// Importa a regra de negócio
import { AuthService } from "../services/auth.service";

// Instancia o serviço
const authService = new AuthService();

export class AuthController {

  /**
   * Método chamado quando alguém faz POST /auth/login
   */
  async login(req: Request, res: Response) {
    try {

      // Pega email e senha do body da requisição
      const { email, senha } = req.body;

      // Chama o serviço (regra de negócio)
      const result = await authService.login(email, senha);

      // Retorna resposta 200 com token e dados
      return res.json(result);

    } catch (error: any) {

      // Se der erro, retorna status 400
      return res.status(400).json({
        message: error.message,
      });
    }
  }
    /**
   * GET /auth/me
   * Rota protegida: depende do middleware preencher req.user
   */
  async me(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const user = await authService.me(req.user.id);
      return res.json(user);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}