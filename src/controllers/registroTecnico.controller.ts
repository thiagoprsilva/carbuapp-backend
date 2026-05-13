import { Request, Response } from "express";
import { RegistroTecnicoService } from "../services/registroTecnico.service";
import { hasManualId, rejectManualIdErrorMessage } from "../utils/rejectManualId";

const service = new RegistroTecnicoService();

export class RegistroTecnicoController {
  async list(req: Request, res: Response) {
    try {
      const oficinaId = req.user!.oficinaId;
      const veiculoId = req.query.veiculoId ? Number(req.query.veiculoId) : undefined;
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const registros = await service.list(oficinaId, veiculoId, limit);
      return res.json(registros);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const oficinaId = req.user!.oficinaId;
      const id = Number(req.params.id);
      if (!id || Number.isNaN(id)) {
        return res.status(400).json({ message: "ID inválido." });
      }
      const os = await service.getById(oficinaId, id);
      return res.json(os);
    } catch (error: any) {
      return res.status(404).json({ message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      if (hasManualId(req.body)) {
        return res.status(400).json({ message: rejectManualIdErrorMessage("ordens de servico") });
      }

      const oficinaId = req.user!.oficinaId;
      const { veiculoId, categoria, descricao, dataServico, observacoes, laudo } = req.body;

      const os = await service.create(oficinaId, {
        veiculoId: Number(veiculoId),
        categoria,
        descricao,
        dataServico,
        observacoes,
        laudo: laudo ?? undefined,
      });

      return res.status(201).json(os);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      if (hasManualId(req.body)) {
        return res.status(400).json({ message: rejectManualIdErrorMessage("ordens de servico") });
      }

      const oficinaId = req.user!.oficinaId;
      const id = Number(req.params.id);
      const { categoria, descricao, dataServico, observacoes } = req.body;

      const os = await service.update(oficinaId, id, {
        categoria,
        descricao,
        dataServico,
        observacoes,
      });

      return res.json(os);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const oficinaId = req.user!.oficinaId;
      const id = Number(req.params.id);
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ message: "status é obrigatório." });
      }

      const os = await service.updateStatus(oficinaId, id, status);
      return res.json(os);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const oficinaId = req.user!.oficinaId;
      const id = Number(req.params.id);
      const result = await service.remove(oficinaId, id);
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}
