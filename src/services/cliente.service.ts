import { prisma } from "../prisma";

export class ClienteService {
  /**
   * Cria um cliente vinculado à oficina do usuário logado
   */
  async create(oficinaId: number, data: { nome: string; telefone?: string }) {
    // Cria no banco garantindo que o cliente pertence à oficina
    const cliente = await prisma.cliente.create({
      data: {
        nome: data.nome,
        telefone: data.telefone,
        oficinaId,
      },
    });

    return cliente;
  }

  /**
   * Lista todos os clientes da oficina do usuário logado
   */
  async list(oficinaId: number) {
    // Retorna apenas clientes daquela oficina (isolamento de dados)
    const clientes = await prisma.cliente.findMany({
      where: { oficinaId },
      orderBy: { createdAt: "desc" }, // mais recentes primeiro
    });

    return clientes;
  }
  /**
   * Atualiza um cliente, mas somente se ele pertencer à mesma oficina
   */
  async update(
    oficinaId: number,
    clienteId: number,
    data: { nome?: string; telefone?: string }
  ) {
    // 1) Garante que o cliente existe e pertence à oficina
    const cliente = await prisma.cliente.findFirst({
      where: { id: clienteId, oficinaId },
    });

    if (!cliente) {
      throw new Error("Cliente não encontrado ou não pertence à sua oficina.");
    }

    // 2) Atualiza apenas os campos enviados
    const updated = await prisma.cliente.update({
      where: { id: clienteId },
      data: {
        ...(data.nome !== undefined ? { nome: data.nome } : {}),
        ...(data.telefone !== undefined ? { telefone: data.telefone } : {}),
      },
    });

    return updated;
  }

  /**
 * Deleta um cliente, mas somente se ele pertencer à mesma oficina
 * e NÃO tiver veículos vinculados.
 */
async delete(oficinaId: number, clienteId: number) {
  // 1) Garante que o cliente existe e pertence à oficina
  const cliente = await prisma.cliente.findFirst({
    where: { id: clienteId, oficinaId },
  });

  if (!cliente) {
    throw new Error("Cliente não encontrado ou não pertence à sua oficina.");
  }

  // 2) Verifica se existe algum veículo ligado a esse cliente
  const totalVeiculos = await prisma.veiculo.count({
    where: { clienteId, oficinaId }, // também garante mesma oficina
  });

  if (totalVeiculos > 0) {
    throw new Error(
      `Não é possível remover o cliente porque existem ${totalVeiculos} veículo(s) vinculado(s). Remova os veículos primeiro.`
    );
  }

  // 3) Agora sim pode deletar
  await prisma.cliente.delete({
    where: { id: clienteId },
  });

  return { message: "Cliente removido com sucesso." };
}

}