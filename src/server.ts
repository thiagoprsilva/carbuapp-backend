import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { clienteRoutes } from "./routes/cliente.routes";
import { veiculoRoutes } from "./routes/veiculo.routes";
import { registroTecnicoRoutes } from "./routes/registroTecnico.routes";
import { orcamentoRoutes } from "./routes/orcamento.routes";
import { publicRoutes } from "./routes/public.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import { searchRoutes } from "./routes/search.routes";

// Importa as rotas de autenticação
import { authRoutes } from "./routes/auth.routes";

// Carrega variáveis do .env
dotenv.config();

const app = express();

const allowedOrigins = [
  "https://carbuapp.com.br",
  "https://www.carbuapp.com.br",
  "http://localhost:5173"
];

// Permite requisições apenas das origens autorizadas
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origem não permitida pelo CORS"));
    },
    credentials: true
  })
);

// Permite trabalhar com JSON no body
app.use(express.json());

// ROTAS ---
app.use("/auth", authRoutes);
app.use("/clientes", clienteRoutes);
app.use("/veiculos", veiculoRoutes);
app.use("/registroTecnico", registroTecnicoRoutes);
app.use("/orcamento", orcamentoRoutes);
app.use("/public", publicRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/api", searchRoutes);

// Rota simples para testar se servidor está rodando
app.get("/health", (req, res) => {
  res.json({ status: "ok", app: "CarbuApp Backend" });
});

// Porta do servidor
const PORT = Number(process.env.PORT) || 3333;

// Sobe o servidor
app.listen(PORT, () => {
  console.log(`CarbuApp rodando em http://localhost:${PORT}`);
});