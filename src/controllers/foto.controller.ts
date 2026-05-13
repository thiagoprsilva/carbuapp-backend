import { Request, Response } from "express";
import { FotoService } from "../services/foto.service";
import path from "path";

const service = new FotoService();

export class FotoController {
  /**
   * POST /registroTecnico/:id/fotos
   */
  async upload(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo enviado." });
      }

      const oficinaId = req.user!.oficinaId;
      const registroTecnicoId = Number(req.params.id);

      if (!registroTecnicoId || Number.isNaN(registroTecnicoId)) {
        return res.status(400).json({ message: "ID da OS inválido." });
      }

      const relativePath = path.join("fotos", req.file.filename);
      const { descricao, zona } = req.body;

      const foto = await service.upload(
        oficinaId,
        registroTecnicoId,
        relativePath,
        descricao,
        zona
      );
      return res.status(201).json(foto);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  /**
   * GET /registroTecnico/:id/fotos
   */
  async list(req: Request, res: Response) {
    try {
      const oficinaId = req.user!.oficinaId;
      const registroTecnicoId = Number(req.params.id);

      if (!registroTecnicoId || Number.isNaN(registroTecnicoId)) {
        return res.status(400).json({ message: "ID da OS inválido." });
      }

      const fotos = await service.list(oficinaId, registroTecnicoId);
      return res.json(fotos);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  /**
   * DELETE /registroTecnico/:id/fotos/:fotoId
   */
  async delete(req: Request, res: Response) {
    try {
      const oficinaId = req.user!.oficinaId;
      const registroTecnicoId = Number(req.params.id);
      const fotoId = Number(req.params.fotoId);

      const result = await service.delete(oficinaId, registroTecnicoId, fotoId);
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}
