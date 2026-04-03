import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import { clienteRoutes } from "./routes/cliente.routes";
import { veiculoRoutes } from "./routes/veiculo.routes";
import { registroTecnicoRoutes } from "./routes/registroTecnico.routes";
import { orcamentoRoutes } from "./routes/orcamento.routes";
import { publicRoutes } from "./routes/public.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import { searchRoutes } from "./routes/search.routes";
import { authRoutes } from "./routes/auth.routes";
import { oficinaRoutes } from "./routes/oficina.routes";
import { usuarioRoutes } from "./routes/usuario.routes";

// Carrega variáveis do .env
dotenv.config();

const app = express();

/**
 * Serve arquivos de upload (logos das oficinas) de forma pública
 * Ex: GET /uploads/logos/oficina-1.png
 */
app.use("/uploads", express.static(path.resolve("uploads")));

/**
 * IMPORTANTE:
 * Necessário para funcionar corretamente com Nginx (proxy reverso)
 * Permite capturar IP real do cliente (rate limit, logs, etc)
 */
app.set("trust proxy", 1);

/**
 * Lista de origens permitidas (CORS)
 */
const allowedOrigins = [
  "https://carbuapp.com.br",
  "https://www.carbuapp.com.br",
  "http://localhost:5173"
];

/**
 * Configuração de CORS segura
 */
app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requisições sem origin (ex: curl, health checks)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origem não permitida pelo CORS"));
    },
    credentials: true
  })
);

/**
 * Permite trabalhar com JSON no body
 */
app.use(express.json());

/**
 * ROTAS
 */
app.use("/auth", authRoutes);
app.use("/clientes", clienteRoutes);
app.use("/veiculos", veiculoRoutes);
app.use("/registroTecnico", registroTecnicoRoutes);
app.use("/orcamento", orcamentoRoutes);
app.use("/public", publicRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/api", searchRoutes);
app.use("/oficinas", oficinaRoutes);
app.use("/usuarios", usuarioRoutes);

/**
 * Rota de health check
 */
app.get("/health", (req, res) => {
  res.json({ status: "ok", app: "CarbuApp Backend" });
});

/**
 * Porta do servidor
 */
const PORT = Number(process.env.PORT) || 3333;

/**
 * Inicializa servidor
 */
app.listen(PORT, () => {
  console.log(`🚀 CarbuApp rodando em http://localhost:${PORT}`);
});