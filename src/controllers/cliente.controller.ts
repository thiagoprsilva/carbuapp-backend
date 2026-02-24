import { Request, Response } from "express";
import { ClienteService } from "../services/cliente.service";

const clienteService = new ClienteService();

export class ClienteController {
  /**
   * POST /clientes
   * Cria um cliente (precisa estar logado)
   */
  async create(req: Request, res: Response) {
    try {
      // Pegamos os dados enviados no body
      const { nome, telefone } = req.body;

      // Validação mínima (no MVP)
      if (!nome || typeof nome !== "string") {
        return res.status(400).json({ message: "Campo 'nome' é obrigatório." });
      }

      // oficinaId vem do token (definido no middleware)
      const oficinaId = req.user!.oficinaId;

      const cliente = await clienteService.create(oficinaId, { nome, telefone });

      return res.status(201).json(cliente);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * GET /clientes
   * Lista clientes da oficina do usuário logado
   */
  async list(req: Request, res: Response) {
    try {
      const oficinaId = req.user!.oficinaId;

      const clientes = await clienteService.list(oficinaId);

      return res.json(clientes);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}