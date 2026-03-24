import { Request, Response } from "express";
import { VeiculoService } from "../services/veiculo.service";
import { hasManualId, rejectManualIdErrorMessage } from "../utils/rejectManualId";

const veiculoService = new VeiculoService();

export class VeiculoController {
  /**
   * POST /veiculos
   * Cria veiculo (precisa token)
   */
  async create(req: Request, res: Response) {
    try {
      if (hasManualId(req.body)) {
        return res.status(400).json({ message: rejectManualIdErrorMessage("veiculos") });
      }

      const { clienteId, placa, modelo, ano, motor, alimentacao } = req.body;

      if (!clienteId || typeof clienteId !== "number") {
        return res.status(400).json({ message: "clienteId e obrigatorio e deve ser numero." });
      }
      if (!placa || typeof placa !== "string") {
        return res.status(400).json({ message: "placa e obrigatoria." });
      }
      if (!modelo || typeof modelo !== "string") {
        return res.status(400).json({ message: "modelo e obrigatorio." });
      }

      const oficinaId = req.user!.oficinaId;
      const veiculo = await veiculoService.create(oficinaId, {
        clienteId,
        placa,
        modelo,
        ano,
        motor,
        alimentacao,
      });

      return res.status(201).json(veiculo);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  /**
   * GET /veiculos
   * Lista veiculos da oficina. Pode filtrar por clienteId.
   */
  async list(req: Request, res: Response) {
    try {
      const oficinaId = req.user!.oficinaId;
      const clienteIdParam = req.query.clienteId as string | undefined;
      const clienteId = clienteIdParam ? Number(clienteIdParam) : undefined;

      const veiculos = await veiculoService.list(oficinaId, clienteId);
      return res.json(veiculos);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * PUT /veiculos/:id
   */
  async update(req: Request, res: Response) {
    try {
      if (hasManualId(req.body)) {
        return res.status(400).json({ message: rejectManualIdErrorMessage("veiculos") });
      }

      const oficinaId = req.user!.oficinaId;
      const veiculoId = Number(req.params.id);

      if (!veiculoId || Number.isNaN(veiculoId)) {
        return res.status(400).json({ message: "ID do veiculo invalido." });
      }

      const { placa, modelo, ano, motor, alimentacao, clienteId } = req.body;

      if (
        placa === undefined &&
        modelo === undefined &&
        ano === undefined &&
        motor === undefined &&
        alimentacao === undefined &&
        clienteId === undefined
      ) {
        return res.status(400).json({ message: "Envie ao menos um campo para atualizar." });
      }

      if (placa !== undefined && typeof placa !== "string") return res.status(400).json({ message: "placa deve ser string." });
      if (modelo !== undefined && typeof modelo !== "string") return res.status(400).json({ message: "modelo deve ser string." });
      if (ano !== undefined && typeof ano !== "string") return res.status(400).json({ message: "ano deve ser string." });
      if (motor !== undefined && typeof motor !== "string") return res.status(400).json({ message: "motor deve ser string." });
      if (alimentacao !== undefined && typeof alimentacao !== "string") return res.status(400).json({ message: "alimentacao deve ser string." });
      if (clienteId !== undefined && typeof clienteId !== "number") return res.status(400).json({ message: "clienteId deve ser number." });

      const updated = await veiculoService.update(oficinaId, veiculoId, {
        placa,
        modelo,
        ano,
        motor,
        alimentacao,
        clienteId,
      });

      return res.json(updated);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  /**
   * DELETE /veiculos/:id
   */
  async delete(req: Request, res: Response) {
    try {
      const oficinaId = req.user!.oficinaId;
      const veiculoId = Number(req.params.id);

      if (!veiculoId || Number.isNaN(veiculoId)) {
        return res.status(400).json({ message: "ID do veiculo invalido." });
      }

      const result = await veiculoService.delete(oficinaId, veiculoId);
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  async show(req: Request, res: Response) {
    try {
      const oficinaId = req.user!.oficinaId;
      const id = Number(req.params.id);

      const veiculo = await veiculoService.findById(oficinaId, id);
      return res.json(veiculo);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}
