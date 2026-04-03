import { Request, Response } from "express";
import { UsuarioService } from "../services/usuario.service";

const service = new UsuarioService();

export class UsuarioController {
  // GET /usuarios?oficinaId=X
  async listar(req: Request, res: Response) {
    try {
      const { role, oficinaId: oficinaIdToken } = req.user!;
      const filtroOficinaId = req.query.oficinaId ? Number(req.query.oficinaId) : undefined;
      const usuarios = await service.listar(role, oficinaIdToken, filtroOficinaId);
      return res.json(usuarios);
    } catch (e: any) {
      return res.status(400).json({ message: e.message });
    }
  }

  // POST /usuarios
  async criar(req: Request, res: Response) {
    try {
      const { role, oficinaId } = req.user!;
      const usuario = await service.criar(role, oficinaId, req.body);
      return res.status(201).json(usuario);
    } catch (e: any) {
      return res.status(400).json({ message: e.message });
    }
  }

  // PATCH /usuarios/:id
  async atualizar(req: Request, res: Response) {
    try {
      const { role, oficinaId } = req.user!;
      const usuario = await service.atualizar(role, oficinaId, Number(req.params.id), req.body);
      return res.json(usuario);
    } catch (e: any) {
      return res.status(400).json({ message: e.message });
    }
  }

  // POST /usuarios/:id/reset-senha
  async redefinirSenha(req: Request, res: Response) {
    try {
      const { role, oficinaId } = req.user!;
      const { novaSenha } = req.body;

      if (!novaSenha) {
        return res.status(400).json({ message: "novaSenha é obrigatório." });
      }

      await service.redefinirSenha(role, oficinaId, Number(req.params.id), novaSenha);
      return res.json({ message: "Senha redefinida com sucesso." });
    } catch (e: any) {
      return res.status(400).json({ message: e.message });
    }
  }
}
