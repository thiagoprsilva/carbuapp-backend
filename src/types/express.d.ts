// Este arquivo "ensina" o TypeScript que existe req.user no Express.
// Sem isso, o TS reclamaria: "Property 'user' does not exist on type Request"

declare namespace Express {
  export interface Request {
    user?: {
      id: number;
      role: string;
      oficinaId: number;
    };
  }
}