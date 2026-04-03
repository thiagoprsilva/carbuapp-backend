import { Request, Response, NextFunction } from "express";

/**
 * Permite acesso apenas para ADMIN e SUPERADMIN.
 * SUPERADMIN tem todos os privilégios de ADMIN + mais.
 * Deve ser usado após authMiddleware.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const role = req.user?.role;

  if (role === "ADMIN" || role === "SUPERADMIN") {
    return next();
  }

  return res.status(403).json({ message: "Acesso restrito a administradores." });
}
