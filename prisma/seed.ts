import bcrypt from "bcrypt";
import { prisma } from "../src/prisma";

async function main() {
  // 1) Cria a oficina (apenas se não existir)
  const oficina = await prisma.oficina.upsert({
    where: { id: 1 },
    update: {},
    create: {
      nome: "Commenale Motorsports",
      responsavel: "Felipe Commenale",
      telefone: "11940730035",
      endereco: "Rua Joaquim das Neves Corticeiro 49",
    },
  });

  // 2) Cria usuário admin (apenas se não existir)
  const adminEmail = "admin@carbuapp.local";
  const adminSenha = "admin123"; // alterar dps

  const senhaHash = await bcrypt.hash(adminSenha, 10);

  await prisma.usuario.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      nome: "Admin (Felipe)",
      email: adminEmail,
      senha: senhaHash,
      role: "ADMIN",
      ativo: true,
      oficinaId: oficina.id,
    },
  });

  console.log("✅ Seed concluído!");
  console.log(`Oficina: ${oficina.nome}`);
  console.log(`Admin: ${adminEmail} / ${adminSenha}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });