import { Request, Response, NextFunction } from "express";

/**
 * Permite acesso apenas para SUPERADMIN.
 * Deve ser usado após authMiddleware.
 */
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role === "SUPERADMIN") {
    return next();
  }

  return res.status(403).json({ message: "Acesso restrito ao super administrador." });
}
