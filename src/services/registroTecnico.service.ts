import { prisma } from "../prisma";

type RegistroCreateDTO = {
  veiculoId: number;
  categoria: string;
  descricao: string;
  pressao?: string;
  gicle?: string;
  combustivel?: string;
  observacoes?: string;
};

export class RegistroTecnicoService {
  /**
   * Cria um registro técnico para um veículo.
   * Regra crítica: o veículo precisa ser da mesma oficina do usuário logado.
   */
  async create(oficinaId: number, data: RegistroCreateDTO) {
    // 1) Valida se o veículo existe e pertence à mesma oficina
    const veiculo = await prisma.veiculo.findFirst({
      where: {
        id: data.veiculoId,
        oficinaId,
      },
    });

    if (!veiculo) {
      throw new Error("Veículo não encontrado ou não pertence à sua oficina.");
    }

    // 2) Cria o registro técnico vinculado ao veículo e à oficina
    const registro = await prisma.registroTecnico.create({
      data: {
        categoria: data.categoria,
        descricao: data.descricao,
        pressao: data.pressao,
        gicle: data.gicle,
        combustivel: data.combustivel,
        observacoes: data.observacoes,
        veiculoId: data.veiculoId,
        oficinaId,
      },
    });

    return registro;
  }

  /**
   * Lista registros técnicos da oficina.
   * Pode filtrar por veiculoId e/ou categoria (útil no front).
   */
  async list(oficinaId: number, veiculoId?: number, categoria?: string) {
    const whereClause: any = { oficinaId };

    if (veiculoId) whereClause.veiculoId = veiculoId;
    if (categoria) whereClause.categoria = categoria;

    const registros = await prisma.registroTecnico.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        veiculo: {
          select: {
            id: true,
            placa: true,
            modelo: true,
            cliente: { select: { id: true, nome: true } },
          },
        },
      },
    });

    return registros;
  }
}