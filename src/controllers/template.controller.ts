import { Request, Response } from "express";
import { TemplateService } from "../services/template.service";

const service = new TemplateService();

export class TemplateController {
  async list(req: Request, res: Response) {
    try {
      const oficinaId = req.user!.oficinaId;
      const templates = await service.list(oficinaId);
      return res.json(templates);
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const oficinaId = req.user!.oficinaId;
      const { nome, itens } = req.body;

      if (!nome || typeof nome !== "string") {
        return res.status(400).json({ message: "nome é obrigatório." });
      }
      if (!Array.isArray(itens) || itens.length === 0) {
        return res.status(400).json({ message: "itens deve ter pelo menos 1 item." });
      }
      for (const it of itens) {
        if (!it.descricao || typeof it.descricao !== "string") {
          return res.status(400).json({ message: "Cada item precisa de descricao." });
        }
      }

      const template = await service.create(oficinaId, { nome, itens });
      return res.status(201).json(template);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const oficinaId = req.user!.oficinaId;
      const id = Number(req.params.id);
      if (!id || Number.isNaN(id)) {
        return res.status(400).json({ message: "ID inválido." });
      }

      const { nome, itens } = req.body;

      if (!nome || typeof nome !== "string") {
        return res.status(400).json({ message: "nome é obrigatório." });
      }
      if (!Array.isArray(itens) || itens.length === 0) {
        return res.status(400).json({ message: "itens deve ter pelo menos 1 item." });
      }

      const template = await service.update(oficinaId, id, { nome, itens });
      return res.json(template);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const oficinaId = req.user!.oficinaId;
      const id = Number(req.params.id);
      if (!id || Number.isNaN(id)) {
        return res.status(400).json({ message: "ID inválido." });
      }
      const result = await service.delete(oficinaId, id);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }
}
