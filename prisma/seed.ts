import bcrypt from "bcrypt";
import { prisma } from "../src/prisma";

async function main() {
  // ====== OFICINAS ======
  // Criado 2 oficinas fixas: Commenale Motorsports e Apocalypse Custom
  // upsert para não duplicar ao rodar o seed mais de uma vez.

  const commenale = await prisma.oficina.upsert({
    where: { id: 1 },
    update: {
      nome: "Commenale Motorsports",
      responsavel: "Felipe Commenale",
      telefone: "11940730035",
      endereco: "Rua Joaquim das Neves Corticeiro 49",
    },
    create: {
      id: 1,
      nome: "Commenale Motorsports",
      responsavel: "Felipe Commenale",
      telefone: "11940730035",
      endereco: "Rua Joaquim das Neves Corticeiro 49",
    },
  });

  const apocalypse = await prisma.oficina.upsert({
    where: { id: 2 },
    update: {
      nome: "Apocalypse Custom",
      responsavel: "Betão",
      telefone: "11949310848",
      endereco: "Rua Anhaduí Mirim 91",
    },
    create: {
      id: 2,
      nome: "Apocalypse Custom",
      responsavel: "Betão",
      telefone: "11949310848",
      endereco: "Rua Anhaduí Mirim 91",
    },
  });

  // ====== USUÁRIOS ADMINS ======
  // Cada oficina terá seu próprio admin, com login separado por oficina.
  // Por enquanto por motivo de testes ambos estão com a mesma senha
  const senhaPadrao = "admin123";
  const senhaHash = await bcrypt.hash(senhaPadrao, 10);

  // Admin Commenale
  const adminCommenaleEmail = "admin@commenale.local";
  await prisma.usuario.upsert({
    where: { email: adminCommenaleEmail },
    update: {
      nome: "Admin (Felipe)",
      senha: senhaHash,
      role: "ADMIN",
      ativo: true,
      oficinaId: commenale.id,
    },
    create: {
      nome: "Admin (Felipe)",
      email: adminCommenaleEmail,
      senha: senhaHash,
      role: "ADMIN",
      ativo: true,
      oficinaId: commenale.id,
    },
  });

  // Admin Apocalypse
  const adminApocalypseEmail = "admin@apocalypse.local";
  await prisma.usuario.upsert({
    where: { email: adminApocalypseEmail },
    update: {
      nome: "Admin (Betão)",
      senha: senhaHash,
      role: "ADMIN",
      ativo: true,
      oficinaId: apocalypse.id,
    },
    create: {
      nome: "Admin (Betão)",
      email: adminApocalypseEmail,
      senha: senhaHash,
      role: "ADMIN",
      ativo: true,
      oficinaId: apocalypse.id,
    },
  });

  console.log("Seed concluído!");
  console.log(`Oficinas: 1) ${commenale.nome} | 2) ${apocalypse.nome}`);
  console.log("Admins criados:");
  console.log(`- ${adminCommenaleEmail} / ${senhaPadrao} (Oficina 1)`);
  console.log(`- ${adminApocalypseEmail} / ${senhaPadrao} (Oficina 2)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });