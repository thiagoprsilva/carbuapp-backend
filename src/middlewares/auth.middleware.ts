import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token não informado" });
  }

  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ message: "Token mal formatado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

    let oficinaId = decoded.oficinaId ?? null;

    // Superadmin pode operar dentro de uma oficina específica via header
    // Isso permite que ele acesse clientes, veículos, etc. de qualquer oficina
    if (decoded.role === "SUPERADMIN") {
      const xOficinaId = req.headers["x-oficina-id"];
      if (xOficinaId && !isNaN(Number(xOficinaId))) {
        oficinaId = Number(xOficinaId);
      }
    }

    req.user = {
      id: decoded.id,
      role: decoded.role,
      oficinaId,
    };

    return next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido ou expirado" });
  }
}
