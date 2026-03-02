/*
  Warnings:

  - You are about to drop the column `combustivel` on the `RegistroTecnico` table. All the data in the column will be lost.
  - You are about to drop the column `gicle` on the `RegistroTecnico` table. All the data in the column will be lost.
  - You are about to drop the column `pressao` on the `RegistroTecnico` table. All the data in the column will be lost.
  - Added the required column `dataServico` to the `RegistroTecnico` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RegistroTecnico" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "categoria" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "dataServico" DATETIME NOT NULL,
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "veiculoId" INTEGER NOT NULL,
    "oficinaId" INTEGER NOT NULL,
    CONSTRAINT "RegistroTecnico_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "Veiculo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RegistroTecnico_oficinaId_fkey" FOREIGN KEY ("oficinaId") REFERENCES "Oficina" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RegistroTecnico" ("categoria", "createdAt", "descricao", "id", "observacoes", "oficinaId", "veiculoId") SELECT "categoria", "createdAt", "descricao", "id", "observacoes", "oficinaId", "veiculoId" FROM "RegistroTecnico";
DROP TABLE "RegistroTecnico";
ALTER TABLE "new_RegistroTecnico" RENAME TO "RegistroTecnico";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
