/*
  Warnings:

  - A unique constraint covering the columns `[oficinaId,numero]` on the table `Orcamento` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Orcamento_oficinaId_numero_key" ON "Orcamento"("oficinaId", "numero");
