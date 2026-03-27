import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ====== OFICINAS ======

  const commenale = await prisma.oficina.upsert({
    where: { id: 1 },
    update: {
      nome: "Commenale Motorsports",
      responsavel: "Felipe Commenale",
      telefone: "11900000001",
      endereco: "Endereço não informado",
    },
    create: {
      nome: "Commenale Motorsports",
      responsavel: "Felipe Commenale",
      telefone: "11900000001",
      endereco: "Endereço não informado",
    },
  });

  const apocalypse = await prisma.oficina.upsert({
    where: { id: 2 },
    update: {
      nome: "Apocalypse Custom",
      responsavel: "Betao",
      telefone: "11900000002",
      endereco: "Endereço não informado",
    },
    create: {
      nome: "Apocalypse Custom",
      responsavel: "Betao",
      telefone: "11900000002",
      endereco: "Endereço não informado",
    },
  });

  // ====== USUARIOS ADMINS ======

  // Lê a senha do ambiente para não expor credenciais no código
  const senhaPadrao = process.env.SEED_ADMIN_PASSWORD;
  if (!senhaPadrao) {
    throw new Error(
      "Variável SEED_ADMIN_PASSWORD não definida no .env. " +
      "Defina-a antes de rodar o seed para proteger as credenciais de acesso."
    );
  }
  const senhaHash = await bcrypt.hash(senhaPadrao, 10);

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

  const adminApocalypseEmail = "admin@apocalypse.local";

  await prisma.usuario.upsert({
    where: { email: adminApocalypseEmail },
    update: {
      nome: "Admin (Betao)",
      senha: senhaHash,
      role: "ADMIN",
      ativo: true,
      oficinaId: apocalypse.id,
    },
    create: {
      nome: "Admin (Betao)",
      email: adminApocalypseEmail,
      senha: senhaHash,
      role: "ADMIN",
      ativo: true,
      oficinaId: apocalypse.id,
    },
  });

  // ====== CLIENTES / VEICULOS / ORCAMENTOS ======

  const nomesClientes = [
    "Joao da Silva",
    "Maria Oliveira",
    "Carlos Souza",
    "Ana Paula",
    "Bruno Santos",
    "Fernanda Lima",
    "Ricardo Alves",
    "Patricia Costa",
    "Thiago Pereira",
    "Juliana Rocha",
    "Felipe Moreira",
    "Camila Carvalho",
    "Rafael Fernandes",
    "Aline Martins",
    "Gustavo Ribeiro",
  ];

  for (let i = 0; i < 15; i++) {
    const indiceHumano = i + 1;
    const oficinaBase = i % 2 === 0 ? commenale : apocalypse;

    const cliente = await prisma.cliente.upsert({
      where: { id: indiceHumano },
      update: {
        nome: nomesClientes[i],
        telefone: `1199${(100000 + i).toString().slice(1)}`,
        oficinaId: oficinaBase.id,
      },
      create: {
        nome: nomesClientes[i],
        telefone: `1199${(100000 + i).toString().slice(1)}`,
        oficinaId: oficinaBase.id,
      },
    });

    const placa = `ABC${(100 + i).toString().slice(1)}`;
    const ano = (2010 + (i % 10)).toString();

    const modelos = [
      "Gol 1.6",
      "Civic 2.0",
      "Corolla 1.8",
      "Onix 1.0 Turbo",
      "HB20 1.6",
      "Palio 1.4",
      "Fiesta 1.6",
      "Uno 1.0",
      "Cruze 1.8",
      "Golf 1.4 TSI",
    ];

    const veiculo = await prisma.veiculo.upsert({
      where: { id: indiceHumano },
      update: {
        placa,
        modelo: modelos[i % modelos.length],
        ano,
        motor: i % 2 === 0 ? "2.0" : "1.6",
        alimentacao: i % 3 === 0 ? "Gasolina" : i % 3 === 1 ? "Etanol" : "Flex",
        clienteId: cliente.id,
        oficinaId: oficinaBase.id,
      },
      create: {
        placa,
        modelo: modelos[i % modelos.length],
        ano,
        motor: i % 2 === 0 ? "2.0" : "1.6",
        alimentacao: i % 3 === 0 ? "Gasolina" : i % 3 === 1 ? "Etanol" : "Flex",
        clienteId: cliente.id,
        oficinaId: oficinaBase.id,
      },
    });

    const numeroOrcamento = indiceHumano;
    const subtotal = 1500 + i * 50;
    const total = subtotal;

    const orcamento = await prisma.orcamento.upsert({
      where: { id: indiceHumano },
      update: {
        numero: numeroOrcamento,
        subtotal,
        total,
        veiculoId: veiculo.id,
        oficinaId: oficinaBase.id,
      },
      create: {
        numero: numeroOrcamento,
        subtotal,
        total,
        veiculoId: veiculo.id,
        oficinaId: oficinaBase.id,
        itens: {
          create: [
            {
              descricao: "Troca de oleo e filtros",
              qtd: 1,
              precoUnit: 400,
              valorLinha: 400,
            },
            {
              descricao: "Revisao sistema de ignicao",
              qtd: 1,
              precoUnit: subtotal - 400,
              valorLinha: subtotal - 400,
            },
          ],
        },
      },
    });

    console.log(
      `Seed registro base: Cliente #${cliente.id} (${cliente.nome}) | Veiculo #${veiculo.id} (${veiculo.placa}) | Orcamento #${orcamento.id} (Oficina ${oficinaBase.id})`
    );
  }

  // ====== RESET DE SEQUÊNCIAS ======
  // Necessário porque o upsert com IDs explícitos não avança a sequência
  // automática do PostgreSQL. Sem isso, o próximo INSERT falharia com
  // "Unique constraint failed on the fields: ('id')".
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Oficina"', 'id'), COALESCE((SELECT MAX(id) FROM "Oficina"), 0) + 1, false)`;
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Usuario"', 'id'), COALESCE((SELECT MAX(id) FROM "Usuario"), 0) + 1, false)`;
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Cliente"', 'id'), COALESCE((SELECT MAX(id) FROM "Cliente"), 0) + 1, false)`;
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Veiculo"', 'id'), COALESCE((SELECT MAX(id) FROM "Veiculo"), 0) + 1, false)`;
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Orcamento"', 'id'), COALESCE((SELECT MAX(id) FROM "Orcamento"), 0) + 1, false)`;
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"OrcamentoItem"', 'id'), COALESCE((SELECT MAX(id) FROM "OrcamentoItem"), 0) + 1, false)`;
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"RegistroTecnico"', 'id'), COALESCE((SELECT MAX(id) FROM "RegistroTecnico"), 0) + 1, false)`;

  console.log("Sequencias resetadas com sucesso!");
  console.log("Seed concluido!");
  console.log(`Oficinas: 1) ${commenale.nome} | 2) ${apocalypse.nome}`);
  console.log("Admins criados:");
  console.log(`- ${adminCommenaleEmail} (Oficina 1)`);
  console.log(`- ${adminApocalypseEmail} (Oficina 2)`);
  console.log("Senha: definida via SEED_ADMIN_PASSWORD no .env (não exibida por segurança)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
