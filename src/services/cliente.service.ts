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
}