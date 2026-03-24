/**
 * fix-sequences.ts
 *
 * Corrige o erro "Unique constraint failed on the fields: ('id')" causado
 * por inserções com IDs explícitos (seed/upsert) que não avançam a sequência
 * automática do PostgreSQL.
 *
 * Execute com:
 *   npx ts-node prisma/fix-sequences.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Corrigindo sequencias do banco de dados...\n");

  const tabelas = [
    "Oficina",
    "Usuario",
    "Cliente",
    "Veiculo",
    "Orcamento",
    "OrcamentoItem",
    "RegistroTecnico",
  ];

  for (const tabela of tabelas) {
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"${tabela}"', 'id'), COALESCE((SELECT MAX(id) FROM "${tabela}"), 0) + 1, false)`
    );
    console.log(`✓ Sequencia da tabela "${tabela}" corrigida.`);
  }

  console.log("\nTodas as sequencias foram corrigidas com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro ao corrigir sequencias:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
