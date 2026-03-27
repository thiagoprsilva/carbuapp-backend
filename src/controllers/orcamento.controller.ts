import { Request, Response } from "express";
import { OrcamentoService } from "../services/orcamento.service";
import { hasManualId, rejectManualIdErrorMessage } from "../utils/rejectManualId";

const service = new OrcamentoService();

export class OrcamentoController {
  /**
   * POST /orcamentos
   * Cria orcamento e itens
   */
  async create(req: Request, res: Response) {
    try {
      if (hasManualId(req.body)) {
        return res.status(400).json({ message: rejectManualIdErrorMessage("orcamentos") });
      }

      const { veiculoId, itens } = req.body;

      if (!veiculoId || typeof veiculoId !== "number") {
        return res.status(400).json({ message: "veiculoId e obrigatorio e deve ser numero." });
      }
      if (!Array.isArray(itens) || itens.length === 0) {
        return res.status(400).json({ message: "itens e obrigatorio e deve ter pelo menos 1 item." });
      }

      for (const item of itens) {
        if (!item.descricao || typeof item.descricao !== "string") {
          return res.status(400).json({ message: "Cada item precisa de descricao (string)." });
        }
        if (item.qtd === undefined || typeof item.qtd !== "number" || item.qtd <= 0) {
          return res.status(400).json({ message: "Cada item precisa de qtd (number > 0)." });
        }
        if (item.precoUnit !== undefined && typeof item.precoUnit !== "number") {
          return res.status(400).json({ message: "precoUnit deve ser number (se informado)." });
        }
      }

      const oficinaId = req.user!.oficinaId;
      const orcamento = await service.create(oficinaId, { veiculoId, itens });

      return res.status(201).json(orcamento);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  /**
   * GET /orcamentos
   * Opcional: ?veiculoId=1 e/ou ?status=Pendente
   */
  async list(req: Request, res: Response) {
    try {
      const oficinaId = req.user!.oficinaId;
      const veiculoIdParam = req.query.veiculoId as string | undefined;
      const veiculoId = veiculoIdParam ? Number(veiculoIdParam) : undefined;
      const status = req.query.status as string | undefined;

      const orcamentos = await service.list(oficinaId, veiculoId, status);
      return res.json(orcamentos);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * PATCH /orcamentos/:id/status
   * Troca rápida de status sem precisar reenviar itens.
   */
  async updateStatus(req: Request, res: Response) {
    try {
      const oficinaId = req.user!.oficinaId;
      const orcamentoId = Number(req.params.id);

      if (!orcamentoId || Number.isNaN(orcamentoId)) {
        return res.status(400).json({ message: "ID do orçamento inválido." });
      }

      const { status } = req.body;

      if (!status || typeof status !== "string") {
        return res.status(400).json({ message: "Envie { status: string } no body." });
      }

      const updated = await service.updateStatus(oficinaId, orcamentoId, status);
      return res.json(updated);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  /**
   * PUT /orcamentos/:id
   * Atualiza orcamento (itens e/ou veiculoId)
   */
  async update(req: Request, res: Response) {
    try {
      if (hasManualId(req.body)) {
        return res.status(400).json({ message: rejectManualIdErrorMessage("orcamentos") });
      }

      const oficinaId = req.user!.oficinaId;
      const orcamentoId = Number(req.params.id);

      if (!orcamentoId || Number.isNaN(orcamentoId)) {
        return res.status(400).json({ message: "ID do orcamento invalido." });
      }

      const { veiculoId, itens } = req.body;

      if (veiculoId === undefined && itens === undefined) {
        return res.status(400).json({ message: "Envie 'veiculoId' e/ou 'itens' para atualizar." });
      }

      if (veiculoId !== undefined && typeof veiculoId !== "number") {
        return res.status(400).json({ message: "veiculoId deve ser number." });
      }

      if (itens !== undefined) {
        if (!Array.isArray(itens) || itens.length === 0) {
          return res.status(400).json({ message: "itens deve ser array com pelo menos 1 item." });
        }

        for (const item of itens) {
          if (!item.descricao || typeof item.descricao !== "string") {
            return res.status(400).json({ message: "Cada item precisa de descricao (string)." });
          }
          if (item.qtd === undefined || typeof item.qtd !== "number" || item.qtd <= 0) {
            return res.status(400).json({ message: "Cada item precisa de qtd (number > 0)." });
          }
          if (item.precoUnit !== undefined && typeof item.precoUnit !== "number") {
            return res.status(400).json({ message: "precoUnit deve ser number (se informado)." });
          }
        }
      }

      const updated = await service.update(oficinaId, orcamentoId, { veiculoId, itens });
      return res.json(updated);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  /**
   * DELETE /orcamentos/:id
   */
  async delete(req: Request, res: Response) {
    try {
      const oficinaId = req.user!.oficinaId;
      const orcamentoId = Number(req.params.id);

      if (!orcamentoId || Number.isNaN(orcamentoId)) {
        return res.status(400).json({ message: "ID do orcamento invalido." });
      }

      const result = await service.delete(oficinaId, orcamentoId);
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}
