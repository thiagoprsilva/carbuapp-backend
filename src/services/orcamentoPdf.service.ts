import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";
import { prisma } from "../prisma";

// Hierarquia de fontes (apenas 3 tamanhos)
const F = {
  title:   16,
  section: 11,
  body:    10,
} as const;

// Cores
const C = {
  black:  "#000000",
  gray:   "#555555",
  line:   "#cccccc",
} as const;

// Margens e colunas da tabela
const MARGIN  = 40;
const PAGE_W  = 515; // 595 (A4) - 2 * 40

const COL = {
  desc:  { x: MARGIN,       w: 285 },
  qtd:   { x: MARGIN + 295, w: 40  },
  unit:  { x: MARGIN + 345, w: 75  },
  total: { x: MARGIN + 430, w: 85  },
} as const;

export class OrcamentoPdfService {
  async generate(oficinaId: number, orcamentoId: number) {

    // 1) Busca dados
    const orcamento = await prisma.orcamento.findFirst({
      where: { id: orcamentoId, oficinaId },
      include: {
        itens: true,
        oficina: true,
        veiculo: { include: { cliente: true } },
      },
    });

    if (!orcamento) {
      throw new Error("Orcamento nao encontrado ou nao pertence a sua oficina.");
    }

    // 2) Inicializa o documento
    const doc = new PDFDocument({ size: "A4", margin: MARGIN });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    const pdfPromise = new Promise<Buffer>((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });

    // Helper: linha horizontal
    const hline = (y?: number, color: string = C.line) => {
      const posY = y ?? doc.y;
      doc.moveTo(MARGIN, posY).lineTo(MARGIN + PAGE_W, posY)
        .strokeColor(color).lineWidth(0.5).stroke()
        .strokeColor(C.black).lineWidth(1);
    };

    // 3) CABECALHO
    const logoUrl  = orcamento.oficina.logoUrl;
    const logoPath = logoUrl ? path.resolve("uploads", logoUrl) : null;
    const hasLogo  = logoPath && fs.existsSync(logoPath);

    if (hasLogo) {
      doc.image(logoPath!, MARGIN, MARGIN, { width: 70 });
      const textX = MARGIN + 82;
      const textW = PAGE_W - 82;
      doc.fontSize(F.section).font("Helvetica-Bold")
        .fillColor(C.black)
        .text(orcamento.oficina.nome, textX, MARGIN, { width: textW });
      doc.fontSize(F.body).font("Helvetica")
        .fillColor(C.gray)
        .text("Responsavel: " + orcamento.oficina.responsavel, textX, doc.y, { width: textW })
        .text("Tel: " + orcamento.oficina.telefone, textX, doc.y, { width: textW })
        .text("Endereco: " + (orcamento.oficina.endereco ?? "Endereco nao informado"), textX, doc.y, { width: textW });
      doc.y = Math.max(doc.y, MARGIN + 75);
    } else {
      doc.fontSize(F.section).font("Helvetica-Bold")
        .fillColor(C.black)
        .text(orcamento.oficina.nome, MARGIN, MARGIN, { width: PAGE_W });
      doc.fontSize(F.body).font("Helvetica")
        .fillColor(C.gray)
        .text("Responsavel: " + orcamento.oficina.responsavel)
        .text("Tel: " + orcamento.oficina.telefone)
        .text("Endereco: " + (orcamento.oficina.endereco ?? "Endereco nao informado"));
    }

    doc.fillColor(C.black);
    doc.moveDown(1);
    hline();
    doc.moveDown(0.8);

    // 4) TITULO DO ORCAMENTO
    doc.fontSize(F.title).font("Helvetica-Bold")
      .text("ORCAMENTO Nº " + orcamento.numero, MARGIN, doc.y, {
        width: PAGE_W,
        align: "center",
      });
    doc.moveDown(1);

    // 5) DADOS DO CLIENTE / VEICULO
    doc.fontSize(F.body).font("Helvetica").fillColor(C.black);
    doc.text("Cliente: " + orcamento.veiculo.cliente.nome);
    doc.text("Telefone: " + (orcamento.veiculo.cliente.telefone ?? "-"));
    doc.text("Veiculo: " + orcamento.veiculo.modelo + " - Placa: " + orcamento.veiculo.placa);
    doc.text("Ano: " + (orcamento.veiculo.ano ?? "-") + " | Motor: " + (orcamento.veiculo.motor ?? "-"));
    doc.moveDown(1);

    // 6) TABELA DE ITENS

    // Cabecalho da tabela
    doc.fontSize(F.body).font("Helvetica-Bold").fillColor(C.black);
    const tHeaderY = doc.y;
    doc.text("Descricao", COL.desc.x,  tHeaderY, { width: COL.desc.w });
    doc.text("Qtd",       COL.qtd.x,   tHeaderY, { width: COL.qtd.w,   align: "right" });
    doc.text("Unit",      COL.unit.x,  tHeaderY, { width: COL.unit.w,  align: "right" });
    doc.text("Total",     COL.total.x, tHeaderY, { width: COL.total.w, align: "right" });

    doc.moveDown(0.4);
    hline(doc.y, C.black);
    doc.moveDown(0.6);

    // Linhas de item
    doc.fontSize(F.body).font("Helvetica").fillColor(C.black);
    orcamento.itens.forEach((item) => {
      const rowY       = doc.y;
      const descHeight = doc.heightOfString(item.descricao, { width: COL.desc.w });

      doc.text(item.descricao,
        COL.desc.x, rowY, { width: COL.desc.w });

      doc.text(String(item.qtd),
        COL.qtd.x, rowY, { width: COL.qtd.w, align: "right" });

      doc.text("R$ " + (item.precoUnit ?? 0).toFixed(2),
        COL.unit.x, rowY, { width: COL.unit.w, align: "right" });

      doc.text("R$ " + (item.valorLinha ?? 0).toFixed(2),
        COL.total.x, rowY, { width: COL.total.w, align: "right" });

      doc.y = rowY + descHeight + 5;
    });

    doc.moveDown(0.4);
    hline();
    doc.moveDown(0.8);

    // 7) TOTAIS
    doc.fontSize(F.body).font("Helvetica").fillColor(C.black);
    doc.text(
      "Subtotal: R$ " + (orcamento.subtotal ?? 0).toFixed(2),
      MARGIN, doc.y, { width: PAGE_W, align: "right" }
    );
    doc.fontSize(F.body).font("Helvetica-Bold");
    doc.text(
      "Total: R$ " + (orcamento.total ?? 0).toFixed(2),
      MARGIN, doc.y, { width: PAGE_W, align: "right" }
    );

    // 8) RODAPE
    doc.moveDown(2);
    doc.fontSize(F.body).font("Helvetica").fillColor(C.black);
    doc.text("Observacoes: _____________________________________");
    doc.moveDown(0.5);
    doc.text("Assinatura:   _____________________________________");

    // 9) Finaliza
    doc.end();
    const pdfBuffer = await pdfPromise;

    return {
      pdfBuffer,
      fileName: "orcamento-" + orcamento.numero + ".pdf",
    };
  }
}
