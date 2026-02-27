// Tipos do Express
import { Request, Response } from "express";

// Importa a regra de negócio
import { AuthService } from "../services/auth.service";

// Instancia o serviço
const authService = new AuthService();

export class AuthController {

  /**
   * POST /auth/login
   * Agora exige email, senha e oficinaId
   */
  async login(req: Request, res: Response) {
    try {

      // Pega dados do body
      const { email, senha, oficinaId } = req.body;

      // Validação básica
      if (!email || !senha || !oficinaId) {
        return res.status(400).json({
          message: "email, senha e oficinaId são obrigatórios.",
        });
      }

      if (typeof oficinaId !== "number") {
        return res.status(400).json({
          message: "oficinaId deve ser number.",
        });
      }

      // Chama o serviço passando também a oficina
      const result = await authService.login(email, senha, oficinaId);

      return res.json(result);

    } catch (error: any) {
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
      return res.status(400).json({
        message: error.message,
      });
    }
  }
}