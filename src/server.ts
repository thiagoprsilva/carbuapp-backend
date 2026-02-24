import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { clienteRoutes } from "./routes/cliente.routes";
import { veiculoRoutes } from "./routes/veiculo.routes";



// Importa as rotas de autenticação
import { authRoutes } from "./routes/auth.routes";

// Carrega variáveis do .env
dotenv.config();

const app = express();

// Permite requisições externas
app.use(cors());

// Permite trabalhar com JSON no body
app.use(express.json());

// ROTAS ---
app.use("/auth", authRoutes);
app.use("/clientes", clienteRoutes);
app.use("/veiculos", veiculoRoutes);

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