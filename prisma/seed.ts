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

  // ====== CLIENTES, VEÍCULOS E ORÇAMENTOS ======
  // Serão criados 15 clientes, 15 veículos e 15 orçamentos de exemplo
  // PARA CADA OFICINA (total 30). Cada cliente terá 1 veículo
  // e 1 orçamento associado a esse veículo.

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

  const oficinasParaSeed = [commenale, apocalypse];

  let indiceGlobal = 1;

  for (const oficinaBase of oficinasParaSeed) {
    for (let i = 0; i < 15; i++) {
      const indiceHumano = indiceGlobal;

      // Cliente
      const cliente = await prisma.cliente.upsert({
        where: { id: indiceHumano },
        update: {
          nome: nomesClientes[i],
          telefone: `1199${(100000 + indiceHumano).toString().slice(1)}`,
          oficinaId: oficinaBase.id,
        },
        create: {
          id: indiceHumano,
          nome: nomesClientes[i],
          telefone: `1199${(100000 + indiceHumano).toString().slice(1)}`,
          oficinaId: oficinaBase.id,
        },
      });

      // Veículo do cliente
      const placa = `ABC${(100 + indiceHumano).toString().slice(1)}`;
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
          id: indiceHumano,
          placa,
          modelo: modelos[i % modelos.length],
          ano,
          motor: i % 2 === 0 ? "2.0" : "1.6",
          alimentacao: i % 3 === 0 ? "Gasolina" : i % 3 === 1 ? "Etanol" : "Flex",
          clienteId: cliente.id,
          oficinaId: oficinaBase.id,
        },
      });

      // Orçamento para ser enviado ao registro técnico
      const numeroOrcamento = i + 1; // 1..15 por oficina
      const subtotal = 1500 + i * 50;
      const total = subtotal; // sem descontos/ acréscimos por enquanto

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
        `Seed registro base: Cliente #${cliente.id} (${cliente.nome}) | Veículo #${veiculo.id} (${veiculo.placa}) | Orçamento #${orcamento.id} (Oficina ${oficinaBase.id})`,
      );

      indiceGlobal++;
    }
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