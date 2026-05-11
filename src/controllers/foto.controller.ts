import { Request, Response } from "express";
import { FotoService } from "../services/foto.service";
import path from "path";

const service = new FotoService();

export class FotoController {
  /**
   * POST /orcamento/:id/fotos
   * Upload de uma foto para o orçamento.
   */
  async upload(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo enviado." });
      }

      const oficinaId = req.user!.oficinaId;
      const orcamentoId = Number(req.params.id);

      if (!orcamentoId || Number.isNaN(orcamentoId)) {
        return res.status(400).json({ message: "ID do orçamento inválido." });
      }

      // Caminho relativo salvo no banco (ex: "fotos/foto-1234567890.jpg")
      const relativePath = path.join("fotos", req.file.filename);
      const { descricao, zona } = req.body;

      const foto = await service.upload(oficinaId, orcamentoId, relativePath, descricao, zona);
      return res.status(201).json(foto);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  /**
   * GET /orcamento/:id/fotos
   */
  async list(req: Request, res: Response) {
    try {
      const oficinaId = req.user!.oficinaId;
      const orcamentoId = Number(req.params.id);

      if (!orcamentoId || Number.isNaN(orcamentoId)) {
        return res.status(400).json({ message: "ID do orçamento inválido." });
      }

      const fotos = await service.list(oficinaId, orcamentoId);
      return res.json(fotos);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  /**
   * DELETE /orcamento/:id/fotos/:fotoId
   */
  async delete(req: Request, res: Response) {
    try {
      const oficinaId = req.user!.oficinaId;
      const orcamentoId = Number(req.params.id);
      const fotoId = Number(req.params.fotoId);

      const result = await service.delete(oficinaId, orcamentoId, fotoId);
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}
