import { prisma } from "../prisma";

type VeiculoCreateDTO = {
  clienteId: number;
  placa: string;
  modelo: string;
  ano?: string;
  motor?: string;
  alimentacao?: string; // ex: "Carburado", "Injeção", "Turbo", "Stage"
};

export class VeiculoService {
  /**
   * Cria um veículo vinculado a um cliente e a uma oficina.
   * Regra importante: o cliente precisa pertencer à mesma oficina do usuário logado.
   */
  async create(oficinaId: number, data: VeiculoCreateDTO) {
    // 1) Verifica se o cliente existe e se é da mesma oficina
    const cliente = await prisma.cliente.findFirst({
      where: {
        id: data.clienteId,
        oficinaId, // garante isolamento por oficina
      },
    });

    if (!cliente) {
      throw new Error("Cliente não encontrado ou não pertence à sua oficina.");
    }

    // 2) Cria o veículo no banco, vinculado ao cliente e à oficina
    const veiculo = await prisma.veiculo.create({
      data: {
        placa: data.placa,
        modelo: data.modelo,
        ano: data.ano,
        motor: data.motor,
        alimentacao: data.alimentacao,
        clienteId: data.clienteId,
        oficinaId,
      },
    });

    return veiculo;
  }

  /**
   * Lista veículos da oficina.
   * Opcionalmente pode filtrar por clienteId (útil pro front).
   */
  async list(oficinaId: number, clienteId?: number) {
    const whereClause: any = { oficinaId };

    // Se vier clienteId, filtramos também
    if (clienteId) {
      whereClause.clienteId = clienteId;
    }

    const veiculos = await prisma.veiculo.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      // include pode ser útil para trazer dados do cliente junto
      include: {
        cliente: {
          select: { id: true, nome: true, telefone: true },
        },
      },
    });

    return veiculos;
  }

/**
 * Atualiza um veículo, apenas se pertencer à mesma oficina
 */
async update(
  oficinaId: number,
  veiculoId: number,
  data: {
    placa?: string;
    modelo?: string;
    ano?: string;
    motor?: string;
    alimentacao?: string;
    clienteId?: number;
  }
) {
  // 1) Confere se o veículo existe na oficina
  const veiculo = await prisma.veiculo.findFirst({
    where: { id: veiculoId, oficinaId },
  });

  if (!veiculo) {
    throw new Error("Veículo não encontrado ou não pertence à sua oficina.");
  }

  // 2) Se quiser trocar clienteId, valida se o cliente também é da mesma oficina
  if (data.clienteId !== undefined) {
    const cliente = await prisma.cliente.findFirst({
      where: { id: data.clienteId, oficinaId },
    });

    if (!cliente) {
      throw new Error("Cliente informado não existe ou não pertence à sua oficina.");
    }
  }

  // 3) Atualiza apenas campos enviados
  const updated = await prisma.veiculo.update({
    where: { id: veiculoId },
    data: {
      ...(data.placa !== undefined ? { placa: data.placa } : {}),
      ...(data.modelo !== undefined ? { modelo: data.modelo } : {}),
      ...(data.ano !== undefined ? { ano: data.ano } : {}),
      ...(data.motor !== undefined ? { motor: data.motor } : {}),
      ...(data.alimentacao !== undefined ? { alimentacao: data.alimentacao } : {}),
      ...(data.clienteId !== undefined ? { clienteId: data.clienteId } : {}),
    },
  });

  return updated;
}

/**
 * Deleta veículo, apenas se pertencer à mesma oficina e NÃO tiver dependências
 */
async delete(oficinaId: number, veiculoId: number) {
  // 1) Confere se existe
  const veiculo = await prisma.veiculo.findFirst({
    where: { id: veiculoId, oficinaId },
  });

  if (!veiculo) {
    throw new Error("Veículo não encontrado ou não pertence à sua oficina.");
  }

  // 2) Bloqueia se tiver registros técnicos
  const registros = await prisma.registroTecnico.count({
    where: { veiculoId, oficinaId },
  });
  if (registros > 0) {
    throw new Error(
      `Não é possível remover o veículo porque existem ${registros} registro(s) técnico(s). Remova os registros primeiro.`
    );
  }

  // 3) Bloqueia se tiver orçamentos
  const orcamentos = await prisma.orcamento.count({
    where: { veiculoId, oficinaId },
  });
  if (orcamentos > 0) {
    throw new Error(
      `Não é possível remover o veículo porque existem ${orcamentos} orçamento(s). Remova os orçamentos primeiro.`
    );
  }

  // 4) Agora pode deletar
  await prisma.veiculo.delete({ where: { id: veiculoId } });

  return { message: "Veículo removido com sucesso." };
}




  
}