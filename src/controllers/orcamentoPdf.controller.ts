import { Request, Response } from "express";
import { OrcamentoPdfService } from "../services/orcamentoPdf.service";

const service = new OrcamentoPdfService();

export class OrcamentoPdfController {
  /**
   * GET /orcamentos/:id/pdf
   * Gera e retorna o PDF para download
   */
  async download(req: Request, res: Response) {
    try {
      const oficinaId = req.user!.oficinaId;
      const orcamentoId = Number(req.params.id);

      if (!orcamentoId || Number.isNaN(orcamentoId)) {
        return res.status(400).json({ message: "ID do orçamento inválido." });
      }

      const { pdfBuffer, fileName } = await service.generate(oficinaId, orcamentoId);

      // Headers para forçar download
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

      return res.send(pdfBuffer);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}