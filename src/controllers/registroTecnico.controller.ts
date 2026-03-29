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

  async create(req: Request, res: Response) {
    try {
      if (hasManualId(req.body)) {
        return res.status(400).json({ message: rejectManualIdErrorMessage("registros tecnicos") });
      }

      const oficinaId = req.user!.oficinaId;
      const { veiculoId, categoria, descricao, dataServico, observacoes, orcamentoId } = req.body;

      const registro = await service.create(oficinaId, {
        veiculoId: Number(veiculoId),
        categoria,
        descricao,
        dataServico,
        observacoes,
        orcamentoId: orcamentoId !== undefined ? Number(orcamentoId) : undefined,
      });

      return res.status(201).json(registro);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      if (hasManualId(req.body)) {
        return res.status(400).json({ message: rejectManualIdErrorMessage("registros tecnicos") });
      }

      const oficinaId = req.user!.oficinaId;
      const id = Number(req.params.id);
      const { veiculoId, categoria, descricao, dataServico, observacoes } = req.body;

      const registro = await service.update(oficinaId, id, {
        veiculoId: veiculoId !== undefined ? Number(veiculoId) : undefined,
        categoria,
        descricao,
        dataServico,
        observacoes,
      });

      return res.json(registro);
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
