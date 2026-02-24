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


 /**
   * PUT /clientes/:id
   * Atualiza cliente
   */
  async update(req: Request, res: Response) {
    try {
      const oficinaId = req.user!.oficinaId;

      // id vem na URL (string) -> converter para number
      const clienteId = Number(req.params.id);

      if (!clienteId || Number.isNaN(clienteId)) {
        return res.status(400).json({ message: "ID do cliente inválido." });
      }

      const { nome, telefone } = req.body;

      // Pelo menos 1 campo deve ser enviado
      if (nome === undefined && telefone === undefined) {
        return res.status(400).json({ message: "Envie ao menos 'nome' ou 'telefone' para atualizar." });
      }

      // Validações básicas se os campos vierem
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
        return res.status(400).json({ message: "ID do cliente inválido." });
      }

      const result = await clienteService.delete(oficinaId, clienteId);

      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}
