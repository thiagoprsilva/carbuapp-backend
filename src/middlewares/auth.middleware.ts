import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/**
 * Middleware de autenticação:
 * - Lê o header Authorization (Bearer TOKEN)
 * - Valida o token usando JWT_SECRET
 * - Extrai o payload e coloca em req.user
 * - Se token inválido -> bloqueia com 401
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  // Precisa existir e estar no formato: "Bearer <token>"
  if (!authHeader) {
    return res.status(401).json({ message: "Token não informado" });
  }

  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ message: "Token mal formatado" });
  }

  try {
    // Valida assinatura e expiração
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

    // Colocamos os dados essenciais do usuário logado na req
    req.user = {
      id: decoded.id,
      role: decoded.role,
      oficinaId: decoded.oficinaId,
    };

    // Continua para a próxima função/rota
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido ou expirado" });
  }
}