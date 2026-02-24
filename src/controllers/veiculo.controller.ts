import { Request, Response } from "express";
import { VeiculoService } from "../services/veiculo.service";

const veiculoService = new VeiculoService();

export class VeiculoController {
  /**
   * POST /veiculos
   * Cria veículo (precisa token)
   */
  async create(req: Request, res: Response) {
    try {
      const { clienteId, placa, modelo, ano, motor, alimentacao } = req.body;

      // Validação mínima do MVP
      if (!clienteId || typeof clienteId !== "number") {
        return res.status(400).json({ message: "clienteId é obrigatório e deve ser número." });
      }
      if (!placa || typeof placa !== "string") {
        return res.status(400).json({ message: "placa é obrigatória." });
      }
      if (!modelo || typeof modelo !== "string") {
        return res.status(400).json({ message: "modelo é obrigatório." });
      }

      // oficinaId vem do token (middleware)
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
      // Erros de regra (cliente não encontrado etc)
      return res.status(400).json({ message: error.message });
    }
  }

  /**
   * GET /veiculos
   * Lista veículos da oficina. Pode filtrar por clienteId (query string).
   * Ex: /veiculos?clienteId=1
   */
  async list(req: Request, res: Response) {
    try {
      const oficinaId = req.user!.oficinaId;

      // clienteId vem via query (string), então convertemos para number
      const clienteIdParam = req.query.clienteId as string | undefined;
      const clienteId = clienteIdParam ? Number(clienteIdParam) : undefined;

      const veiculos = await veiculoService.list(oficinaId, clienteId);

      return res.json(veiculos);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}