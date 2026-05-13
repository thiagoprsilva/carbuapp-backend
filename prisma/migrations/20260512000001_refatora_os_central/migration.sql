-- ============================================================
-- Fase 1.6 — Refatoração OS Central
-- RegistroTecnico passa a ser a OS mãe de tudo.
-- Laudo e Fotos saem do Orcamento e vão para o RegistroTecnico.
-- Orcamento passa a ter registroTecnicoId obrigatório.
-- ============================================================

-- ─── 1. Adicionar numero + status ao RegistroTecnico ────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='RegistroTecnico' AND column_name='numero'
  ) THEN
    ALTER TABLE "RegistroTecnico" ADD COLUMN "numero" INTEGER;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='RegistroTecnico' AND column_name='status'
  ) THEN
    ALTER TABLE "RegistroTecnico" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'Aberta';
  END IF;
END $$;

-- Popular numero para registros existentes (sequencial por oficina)
WITH ranked AS (
  SELECT id, "oficinaId",
    ROW_NUMBER() OVER (PARTITION BY "oficinaId" ORDER BY "createdAt", id) AS rn
  FROM "RegistroTecnico"
  WHERE "numero" IS NULL
)
UPDATE "RegistroTecnico" rt
SET "numero" = ranked.rn
FROM ranked
WHERE rt.id = ranked.id;

-- Garantia de não-nulo para qualquer registro restante
UPDATE "RegistroTecnico" SET "numero" = id WHERE "numero" IS NULL;

-- Tornar numero NOT NULL
ALTER TABLE "RegistroTecnico" ALTER COLUMN "numero" SET NOT NULL;

-- Unique constraint (numero por oficina)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'RegistroTecnico_oficinaId_numero_key'
  ) THEN
    ALTER TABLE "RegistroTecnico"
      ADD CONSTRAINT "RegistroTecnico_oficinaId_numero_key" UNIQUE ("oficinaId", "numero");
  END IF;
END $$;

-- ─── 2. Remover orcamentoId de RegistroTecnico (relação antiga, invertida) ───

ALTER TABLE "RegistroTecnico" DROP CONSTRAINT IF EXISTS "RegistroTecnico_orcamentoId_fkey";
ALTER TABLE "RegistroTecnico" DROP COLUMN IF EXISTS "orcamentoId";

-- ─── 3. Adicionar registroTecnicoId em Orcamento ────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='Orcamento' AND column_name='registroTecnicoId'
  ) THEN
    ALTER TABLE "Orcamento" ADD COLUMN "registroTecnicoId" INTEGER;
  END IF;
END $$;

-- ─── 4. Criar OS pai para cada Orcamento órfão (sem registroTecnicoId) ───────

DO $$
DECLARE
  orc     RECORD;
  max_num INTEGER;
  new_id  INTEGER;
BEGIN
  FOR orc IN
    SELECT * FROM "Orcamento"
    WHERE "registroTecnicoId" IS NULL
    ORDER BY "createdAt", id
  LOOP
    SELECT COALESCE(MAX(numero), 0) INTO max_num
    FROM "RegistroTecnico"
    WHERE "oficinaId" = orc."oficinaId";

    INSERT INTO "RegistroTecnico"
      (numero, status, categoria, descricao, "dataServico", "createdAt", "veiculoId", "oficinaId")
    VALUES (
      max_num + 1,
      'Concluída',
      'Manutenção',
      'OS migrada automaticamente',
      orc."createdAt",
      orc."createdAt",
      orc."veiculoId",
      orc."oficinaId"
    )
    RETURNING id INTO new_id;

    UPDATE "Orcamento" SET "registroTecnicoId" = new_id WHERE id = orc.id;
  END LOOP;
END $$;

-- Tornar registroTecnicoId NOT NULL
ALTER TABLE "Orcamento" ALTER COLUMN "registroTecnicoId" SET NOT NULL;

-- FK constraint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Orcamento_registroTecnicoId_fkey'
  ) THEN
    ALTER TABLE "Orcamento"
      ADD CONSTRAINT "Orcamento_registroTecnicoId_fkey"
      FOREIGN KEY ("registroTecnicoId") REFERENCES "RegistroTecnico"(id)
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- ─── 5. Recriar LaudoEntrada, AvariaItem e Foto com FK no RegistroTecnico ────
-- Sem dados em produção — drop seguro

DROP TABLE IF EXISTS "AvariaItem";
DROP TABLE IF EXISTS "LaudoEntrada";
DROP TABLE IF EXISTS "Foto";

CREATE TABLE "LaudoEntrada" (
  "id"                SERIAL NOT NULL,
  "km"                INTEGER,
  "nivelCombust"      TEXT,
  "observacoes"       TEXT,
  "criadoEm"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "registroTecnicoId" INTEGER NOT NULL,
  CONSTRAINT "LaudoEntrada_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "LaudoEntrada_registroTecnicoId_key" UNIQUE ("registroTecnicoId"),
  CONSTRAINT "LaudoEntrada_registroTecnicoId_fkey"
    FOREIGN KEY ("registroTecnicoId") REFERENCES "RegistroTecnico"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "AvariaItem" (
  "id"         SERIAL NOT NULL,
  "zona"       TEXT NOT NULL,
  "severidade" TEXT,
  "observacao" TEXT,
  "laudoId"    INTEGER NOT NULL,
  CONSTRAINT "AvariaItem_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AvariaItem_laudoId_fkey"
    FOREIGN KEY ("laudoId") REFERENCES "LaudoEntrada"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Foto" (
  "id"                SERIAL NOT NULL,
  "url"               TEXT NOT NULL,
  "descricao"         TEXT,
  "zona"              TEXT,
  "criadoEm"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "registroTecnicoId" INTEGER NOT NULL,
  CONSTRAINT "Foto_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Foto_registroTecnicoId_fkey"
    FOREIGN KEY ("registroTecnicoId") REFERENCES "RegistroTecnico"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);
