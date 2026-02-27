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


/**
 * PUT /registros-tecnicos/:id
 * Atualiza registro técnico
 */
async update(req: Request, res: Response) {
  try {
    const oficinaId = req.user!.oficinaId;
    const registroId = Number(req.params.id);

    if (!registroId || Number.isNaN(registroId)) {
      return res.status(400).json({ message: "ID do registro inválido." });
    }

    const { categoria, descricao, pressao, gicle, combustivel, observacoes, veiculoId } = req.body;

    // Precisa mandar pelo menos 1 campo
    if (
      categoria === undefined &&
      descricao === undefined &&
      pressao === undefined &&
      gicle === undefined &&
      combustivel === undefined &&
      observacoes === undefined &&
      veiculoId === undefined
    ) {
      return res.status(400).json({ message: "Envie ao menos um campo para atualizar." });
    }

    // Validações simples
    if (categoria !== undefined && typeof categoria !== "string")
      return res.status(400).json({ message: "categoria deve ser string." });

    if (descricao !== undefined && typeof descricao !== "string")
      return res.status(400).json({ message: "descricao deve ser string." });

    if (pressao !== undefined && typeof pressao !== "string")
      return res.status(400).json({ message: "pressao deve ser string." });

    if (gicle !== undefined && typeof gicle !== "string")
      return res.status(400).json({ message: "gicle deve ser string." });

    if (combustivel !== undefined && typeof combustivel !== "string")
      return res.status(400).json({ message: "combustivel deve ser string." });

    if (observacoes !== undefined && typeof observacoes !== "string")
      return res.status(400).json({ message: "observacoes deve ser string." });

    if (veiculoId !== undefined && typeof veiculoId !== "number")
      return res.status(400).json({ message: "veiculoId deve ser number." });

    const updated = await registroService.update(oficinaId, registroId, {
      categoria,
      descricao,
      pressao,
      gicle,
      combustivel,
      observacoes,
      veiculoId,
    });

    return res.json(updated);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
}

/**
 * DELETE /registros-tecnicos/:id
 */
async delete(req: Request, res: Response) {
  try {
    const oficinaId = req.user!.oficinaId;
    const registroId = Number(req.params.id);

    if (!registroId || Number.isNaN(registroId)) {
      return res.status(400).json({ message: "ID do registro inválido." });
    }

    const result = await registroService.delete(oficinaId, registroId);
    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
}




}
