-- CreateTable
CREATE TABLE "TemplateServico" (
    "id"        SERIAL NOT NULL,
    "nome"      TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oficinaId" INTEGER NOT NULL,

    CONSTRAINT "TemplateServico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateServicoItem" (
    "id"        SERIAL NOT NULL,
    "descricao" TEXT NOT NULL,
    "qtd"       INTEGER NOT NULL DEFAULT 1,
    "precoUnit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "templateId" INTEGER NOT NULL,

    CONSTRAINT "TemplateServicoItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TemplateServico" ADD CONSTRAINT "TemplateServico_oficinaId_fkey"
    FOREIGN KEY ("oficinaId") REFERENCES "Oficina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateServicoItem" ADD CONSTRAINT "TemplateServicoItem_templateId_fkey"
    FOREIGN KEY ("templateId") REFERENCES "TemplateServico"("id") ON DELETE CASCADE ON UPDATE CASCADE;
