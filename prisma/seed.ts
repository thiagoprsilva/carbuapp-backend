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

  const senhaPadrao = "admin123";
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

  // ====== CLIENTES / VEÍCULOS / ORÇAMENTOS ======

  const nomesClientes = [
    "João da Silva",
    "Maria Oliveira",
    "Carlos Souza",
    "Ana Paula",
    "Bruno Santos",
    "Fernanda Lima",
    "Ricardo Alves",
    "Patrícia Costa",
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
        id: indiceHumano,
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
        alimentacao:
          i % 3 === 0 ? "Gasolina" : i % 3 === 1 ? "Etanol" : "Flex",
        clienteId: cliente.id,
        oficinaId: oficinaBase.id,
      },
      create: {
        id: indiceHumano,
        placa,
        modelo: modelos[i % modelos.length],
        ano,
        motor: i % 2 === 0 ? "2.0" : "1.6",
        alimentacao:
          i % 3 === 0 ? "Gasolina" : i % 3 === 1 ? "Etanol" : "Flex",
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
        id: indiceHumano,
        numero: numeroOrcamento,
        subtotal,
        total,
        veiculoId: veiculo.id,
        oficinaId: oficinaBase.id,
        itens: {
          create: [
            {
              descricao: "Troca de óleo e filtros",
              qtd: 1,
              precoUnit: 400,
              valorLinha: 400,
            },
            {
              descricao: "Revisão sistema de ignição",
              qtd: 1,
              precoUnit: subtotal - 400,
              valorLinha: subtotal - 400,
            },
          ],
        },
      },
    });

    console.log(
      `Seed registro base: Cliente #${cliente.id} (${cliente.nome}) | Veículo #${veiculo.id} (${veiculo.placa}) | Orçamento #${orcamento.id} (Oficina ${oficinaBase.id})`
    );
  }

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