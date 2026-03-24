import { Request, Response } from "express";
import { ClienteService } from "../services/cliente.service";
import { hasManualId, rejectManualIdErrorMessage } from "../utils/rejectManualId";

const clienteService = new ClienteService();

export class ClienteController {
  /**
   * POST /clientes
   * Cria um cliente (precisa estar logado)
   */
  async create(req: Request, res: Response) {
    try {
      if (hasManualId(req.body)) {
        return res.status(400).json({ message: rejectManualIdErrorMessage("clientes") });
      }

      const { nome, telefone } = req.body;

      if (!nome || typeof nome !== "string") {
        return res.status(400).json({ message: "Campo 'nome' e obrigatorio." });
      }

      const oficinaId = req.user!.oficinaId;
      const cliente = await clienteService.create(oficinaId, { nome, telefone });

      return res.status(201).json(cliente);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * GET /clientes
   * Lista clientes da oficina do usuario logado
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

  /**
   * PUT /clientes/:id
   * Atualiza cliente
   */
  async update(req: Request, res: Response) {
    try {
      if (hasManualId(req.body)) {
        return res.status(400).json({ message: rejectManualIdErrorMessage("clientes") });
      }

      const oficinaId = req.user!.oficinaId;
      const clienteId = Number(req.params.id);

      if (!clienteId || Number.isNaN(clienteId)) {
        return res.status(400).json({ message: "ID do cliente invalido." });
      }

      const { nome, telefone } = req.body;

      if (nome === undefined && telefone === undefined) {
        return res.status(400).json({ message: "Envie ao menos 'nome' ou 'telefone' para atualizar." });
      }

      if (nome !== undefined && typeof nome !== "string") {
        return res.status(400).json({ message: "'nome' deve ser string." });
      }
      if (telefone !== undefined && typeof telefone !== "string") {
        return res.status(400).json({ message: "'telefone' deve ser string." });
      }

      const updated = await clienteService.update(oficinaId, clienteId, { nome, telefone });

      return res.json(updated);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  /**
   * DELETE /clientes/:id
   * Remove cliente
   */
  async delete(req: Request, res: Response) {
    try {
      const oficinaId = req.user!.oficinaId;
      const clienteId = Number(req.params.id);

      if (!clienteId || Number.isNaN(clienteId)) {
        return res.status(400).json({ message: "ID do cliente invalido." });
      }

      const result = await clienteService.delete(oficinaId, clienteId);

      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  async show(req: Request, res: Response) {
    try {
      const oficinaId = req.user!.oficinaId;
      const id = Number(req.params.id);

      const cliente = await clienteService.findById(oficinaId, id);
      return res.json(cliente);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}
