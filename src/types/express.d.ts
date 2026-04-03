// Este arquivo "ensina" o TypeScript que existe req.user no Express.
// Sem isso, o TS reclamaria: "Property 'user' does not exist on type Request"

declare namespace Express {
  export interface Request {
    user?: {
      id: number;
      role: string;
      // null para o superadmin global (sem vínculo com oficina)
      oficinaId: number | null;
    };
  }
}
