import { Request, Response } from "express";
import { OficinaService } from "../services/oficina.service";

const service = new OficinaService();

export class OficinaController {
  // GET /oficinas — lista todas (superadmin)
  async listar(req: Request, res: Response) {
    try {
      const oficinas = await service.listarTodas();
      return res.json(oficinas);
    } catch (e: any) {
      return res.status(400).json({ message: e.message });
    }
  }

  // GET /oficinas/:id — detalhes de uma (superadmin)
  async detalhe(req: Request, res: Response) {
    try {
      const oficina = await service.buscarPorId(Number(req.params.id));
      return res.json(oficina);
    } catch (e: any) {
      return res.status(404).json({ message: e.message });
    }
  }

  // POST /oficinas — criar nova (superadmin)
  async criar(req: Request, res: Response) {
    try {
      const oficina = await service.criar(req.body);
      return res.status(201).json(oficina);
    } catch (e: any) {
      return res.status(400).json({ message: e.message });
    }
  }

  // PATCH /oficinas/:id — editar dados (superadmin edita qualquer; admin edita a sua)
  async atualizar(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const role = req.user?.role;
      const oficinaIdDoToken = req.user?.oficinaId;

      // Admin só pode editar a própria oficina
      if (role === "ADMIN" && oficinaIdDoToken !== id) {
        return res.status(403).json({ message: "Você só pode editar sua própria oficina." });
      }

      const { nome, responsavel, telefone, endereco } = req.body;
      const oficina = await service.atualizar(id, { nome, responsavel, telefone, endereco });
      return res.json(oficina);
    } catch (e: any) {
      return res.status(400).json({ message: e.message });
    }
  }

  // POST /oficinas/:id/logo — upload de logo (admin edita a sua; superadmin edita qualquer)
  async uploadLogo(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo enviado." });
      }

      const id = Number(req.params.id);
      const role = req.user?.role;
      const oficinaIdDoToken = req.user?.oficinaId;

      if (role === "ADMIN" && oficinaIdDoToken !== id) {
        return res.status(403).json({ message: "Você só pode alterar o logo da sua oficina." });
      }

      const oficina = await service.salvarLogo(id, req.file);
      return res.json({ message: "Logo salvo com sucesso.", logoUrl: oficina.logoUrl });
    } catch (e: any) {
      return res.status(400).json({ message: e.message });
    }
  }

  // DELETE /oficinas/:id/logo — remover logo
  async removerLogo(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const role = req.user?.role;
      const oficinaIdDoToken = req.user?.oficinaId;

      if (role === "ADMIN" && oficinaIdDoToken !== id) {
        return res.status(403).json({ message: "Você só pode remover o logo da sua oficina." });
      }

      await service.removerLogo(id);
      return res.json({ message: "Logo removido com sucesso." });
    } catch (e: any) {
      return res.status(400).json({ message: e.message });
    }
  }
}
