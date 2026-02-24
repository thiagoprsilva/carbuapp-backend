import PDFDocument from "pdfkit";
import { prisma } from "../prisma";

/**
 * Serviço responsável por gerar o PDF do orçamento.
 * Ele busca o orçamento no banco e monta um PDF com os dados.
 */
export class OrcamentoPdfService {
  async generate(oficinaId: number, orcamentoId: number) {
    // 1) Busca orçamento no banco e garante que é da mesma oficina
    const orcamento = await prisma.orcamento.findFirst({
      where: { id: orcamentoId, oficinaId },
      include: {
        itens: true,
        oficina: true,
        veiculo: {
          include: {
            cliente: true,
          },
        },
      },
    });

    if (!orcamento) {
      throw new Error("Orçamento não encontrado ou não pertence à sua oficina.");
    }

    // 2) Cria o documento PDF em memória
    const doc = new PDFDocument({ size: "A4", margin: 40 });

    // Vamos retornar o PDF como Buffer
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    const pdfPromise = new Promise<Buffer>((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });

    // 3) Montagem do PDF
    doc.fontSize(18).text(`ORÇAMENTO Nº ${orcamento.numero}`, { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Oficina: ${orcamento.oficina.nome}`);
    doc.text(`Responsável: ${orcamento.oficina.responsavel}`);
    doc.text(`Telefone: ${orcamento.oficina.telefone}`);
    doc.text(`Endereço: ${orcamento.oficina.endereco}`);
    doc.moveDown();

    doc.text(`Cliente: ${orcamento.veiculo.cliente.nome}`);
    doc.text(`Telefone Cliente: ${orcamento.veiculo.cliente.telefone ?? "-"}`);
    doc.text(`Veículo: ${orcamento.veiculo.modelo} - Placa: ${orcamento.veiculo.placa}`);
    doc.text(`Ano: ${orcamento.veiculo.ano ?? "-"} | Motor: ${orcamento.veiculo.motor ?? "-"}`);
    doc.moveDown();

    doc.fontSize(13).text("Itens do orçamento:", { underline: true });
    doc.moveDown(0.5);

    // ====== TABELA COM COLUNAS FIXAS (corrige o layout "torto") ======
    // Posições e larguras das colunas (A4 com margin 40)
    const xDesc = 40;
    const wDesc = 280;

    const xQtd = 330;
    const wQtd = 40;

    const xUnit = 380;
    const wUnit = 70;

    const xTotal = 460;
    const wTotal = 90;

    // Cabeçalho
    doc.fontSize(11).font("Helvetica-Bold");
    doc.text("Descrição", xDesc, doc.y, { width: wDesc });

    // Para manter o cabeçalho alinhado na mesma linha do "Descrição"
    const headerY = doc.y - 12;
    doc.text("Qtd", xQtd, headerY, { width: wQtd, align: "right" });
    doc.text("Unit", xUnit, headerY, { width: wUnit, align: "right" });
    doc.text("Total", xTotal, headerY, { width: wTotal, align: "right" });

    doc.moveDown(0.3);
    doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.6);

    doc.font("Helvetica");

    // Linhas
    orcamento.itens.forEach((item) => {
      // Guarda o "y" atual para alinhar as colunas na mesma linha
      const y = doc.y;

      // Descrição com largura fixa (pode quebrar linha sem empurrar colunas)
      doc.text(item.descricao, xDesc, y, { width: wDesc });

      // Calcula altura ocupada pela descrição para posicionar próxima linha corretamente
      const descHeight = doc.heightOfString(item.descricao, { width: wDesc });

      // Colunas numéricas alinhadas à direita em widths fixas
      doc.text(String(item.qtd), xQtd, y, { width: wQtd, align: "right" });

      doc.text(`R$ ${(item.precoUnit ?? 0).toFixed(2)}`, xUnit, y, {
        width: wUnit,
        align: "right",
      });

      doc.text(`R$ ${(item.valorLinha ?? 0).toFixed(2)}`, xTotal, y, {
        width: wTotal,
        align: "right",
      });

      // Move o cursor para baixo baseado na altura real da descrição
      doc.y = y + descHeight + 6;
    });

    doc.moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Totais alinhados à direita com largura fixa (fica bem retinho)
    doc.fontSize(12);
    doc.text(`Subtotal: R$ ${(orcamento.subtotal ?? 0).toFixed(2)}`, 40, doc.y, {
      width: 510,
      align: "right",
    });
    doc.text(`Total: R$ ${(orcamento.total ?? 0).toFixed(2)}`, 40, doc.y, {
      width: 510,
      align: "right",
    });

    doc.moveDown(2);
    doc.fontSize(10).text("Observações: _________________________________");
    doc.text("Assinatura: ___________________________________");

    // Finaliza
    doc.end();

    // 4) Retorna o buffer + dados úteis
    const pdfBuffer = await pdfPromise;

    return {
      pdfBuffer,
      fileName: `orcamento-${orcamento.numero}.pdf`,
    };
  }
}