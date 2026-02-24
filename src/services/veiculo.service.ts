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
}