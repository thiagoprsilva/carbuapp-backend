import { Request, Response } from "express";
import { LaudoService } from "../services/laudo.service";

const service = new LaudoService();

export class LaudoController {
  /**
   * POST /orcamento/:id/laudo
   * Cria ou substitui o laudo de entrada de um orçamento.
   */
  async upsert(req: Request, res: Response) {
    try {
      const oficinaId = req.user!.oficinaId;
      const orcamentoId = Number(req.params.id);

      if (!orcamentoId || Number.isNaN(orcamentoId)) {
        return res.status(400).json({ message: "ID do orçamento inválido." });
      }

      const { km, nivelCombust, observacoes, avarias } = req.body;

      const laudo = await service.upsert(oficinaId, orcamentoId, {
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
   * GET /orcamento/:id/laudo
   * Retorna o laudo (ou 404 se não existir).
   */
  async get(req: Request, res: Response) {
    try {
      const oficinaId = req.user!.oficinaId;
      const orcamentoId = Number(req.params.id);

      if (!orcamentoId || Number.isNaN(orcamentoId)) {
        return res.status(400).json({ message: "ID do orçamento inválido." });
      }

      const laudo = await service.get(oficinaId, orcamentoId);

      if (!laudo) {
        return res.status(404).json({ message: "Laudo não encontrado." });
      }

      return res.json(laudo);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  /**
   * DELETE /orcamento/:id/laudo
   */
  async delete(req: Request, res: Response) {
    try {
      const oficinaId = req.user!.oficinaId;
      const orcamentoId = Number(req.params.id);

      if (!orcamentoId || Number.isNaN(orcamentoId)) {
        return res.status(400).json({ message: "ID do orçamento inválido." });
      }

      const result = await service.delete(oficinaId, orcamentoId);
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}
