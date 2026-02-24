import { Request, Response } from "express";
import { RegistroTecnicoService } from "../services/registroTecnico.service";

const registroService = new RegistroTecnicoService();

export class RegistroTecnicoController {
  /**
   * POST /registros-tecnicos
   * Cria registro técnico (precisa token)
   */
  async create(req: Request, res: Response) {
    try {
      const {
        veiculoId,
        categoria,
        descricao,
        pressao,
        gicle,
        combustivel,
        observacoes,
      } = req.body;

      // Validação mínima para MVP
      if (!veiculoId || typeof veiculoId !== "number") {
        return res.status(400).json({ message: "veiculoId é obrigatório e deve ser número." });
      }
      if (!categoria || typeof categoria !== "string") {
        return res.status(400).json({ message: "categoria é obrigatória." });
      }
      if (!descricao || typeof descricao !== "string") {
        return res.status(400).json({ message: "descricao é obrigatória." });
      }

      // oficinaId vem do token
      const oficinaId = req.user!.oficinaId;

      const registro = await registroService.create(oficinaId, {
        veiculoId,
        categoria,
        descricao,
        pressao,
        gicle,
        combustivel,
        observacoes,
      });

      return res.status(201).json(registro);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  /**
   * GET /registros-tecnicos
   * Pode filtrar:
   * - /registros-tecnicos?veiculoId=1
   * - /registros-tecnicos?categoria=Turbo
   * - /registros-tecnicos?veiculoId=1&categoria=Carburador
   */
  async list(req: Request, res: Response) {
    try {
      const oficinaId = req.user!.oficinaId;

      const veiculoIdParam = req.query.veiculoId as string | undefined;
      const veiculoId = veiculoIdParam ? Number(veiculoIdParam) : undefined;

      const categoria = req.query.categoria as string | undefined;

      const registros = await registroService.list(oficinaId, veiculoId, categoria);

      return res.json(registros);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}