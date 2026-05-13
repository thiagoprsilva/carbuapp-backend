import { Request, Response } from "express";
import { LaudoService } from "../services/laudo.service";

const service = new LaudoService();

export class LaudoController {
  /**
   * POST /registroTecnico/:id/laudo
   * Cria ou substitui o laudo de entrada de uma OS.
   */
  async upsert(req: Request, res: Response) {
    try {
      const oficinaId = req.user!.oficinaId;
      const registroTecnicoId = Number(req.params.id);

      if (!registroTecnicoId || Number.isNaN(registroTecnicoId)) {
        return res.status(400).json({ message: "ID da OS inválido." });
      }

      const { km, nivelCombust, observacoes, avarias } = req.body;

      const laudo = await service.upsert(oficinaId, registroTecnicoId, {
        km: km !== undefined ? Number(km) : undefined,
        nivelCombust,
        observacoes,
        avarias,
      });

      return res.status(201).json(laudo);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  /**
   * GET /registroTecnico/:id/laudo
   * Retorna o laudo (ou 404 se não existir).
   */
  async get(req: Request, res: Response) {
    try {
      const oficinaId = req.user!.oficinaId;
      const registroTecnicoId = Number(req.params.id);

      if (!registroTecnicoId || Number.isNaN(registroTecnicoId)) {
        return res.status(400).json({ message: "ID da OS inválido." });
      }

      const laudo = await service.get(oficinaId, registroTecnicoId);

      if (!laudo) {
        return res.status(404).json({ message: "Laudo não encontrado." });
      }

      return res.json(laudo);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  /**
   * DELETE /registroTecnico/:id/laudo
   */
  async delete(req: Request, res: Response) {
    try {
      const oficinaId = req.user!.oficinaId;
      const registroTecnicoId = Number(req.params.id);

      if (!registroTecnicoId || Number.isNaN(registroTecnicoId)) {
        return res.status(400).json({ message: "ID da OS inválido." });
      }

      const result = await service.delete(oficinaId, registroTecnicoId);
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}
