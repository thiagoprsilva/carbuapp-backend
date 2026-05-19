# CarbuApp – Backend
### Sistema para Oficinas Automotivas
**Projeto Integrador – UNASP 2026/1**

---

## Sobre o Projeto

O **CarbuApp** é um sistema de gestão para oficinas automotivas de pequeno porte, com foco em mecânicos iniciantes e oficinas que ainda não utilizam sistema algum.

O objetivo é oferecer uma solução:

- Simples
- De baixo custo
- Organizada
- Voltada para controle técnico de veículos
- Com geração automática de orçamentos em PDF

Clientes de referência: **Commenale Motorsports**, **Apocalypse Custom**

---

## Público-Alvo

Oficinas automotivas de pequeno porte, especialmente:

- Mecânicos que ainda trabalham apenas com papel
- Mecânicos iniciantes
- Oficinas que trabalham em:
  - Carros originais
  - Preparações personalizadas
  - Funilária e Mecânica no Geral

---

# Arquitetura do Backend

## Tecnologias Utilizadas

- **Node.js**
- **Express**
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL**
- **JWT (JSON Web Token)**
- **Docker**
- **Multer** (upload de imagens)
- **PDFKit** (geração de PDF)
- **bcrypt** (hash de senhas)

---

## Autenticação

O sistema utiliza **JSON Web Token (JWT)** para:

- Login autenticado
- Proteção de rotas
- Isolamento de dados por oficina

Todas as rotas protegidas exigem:
```
Authorization: Bearer <token>
```

Roles suportados: `SUPERADMIN`, `ADMIN`, `MECANICO`

---

# Modelagem do Sistema

## Entidades principais

- **Oficina** — multi-tenant, cada oficina tem seus próprios dados
- **Usuario** — vinculado à oficina, com roles
- **Cliente** — pertence à oficina
- **Veiculo** — pertence ao cliente e à oficina
- **RegistroTecnico (OS)** — entidade central, pai de laudo, fotos e orçamentos
- **LaudoEntrada** — diagrama de avarias vinculado à OS
- **Foto** — evidências fotográficas vinculadas à OS
- **Orcamento** — sempre filho de uma OS, com itens
- **OrcamentoItem** — itens do orçamento
- **TemplateServico** — modelos reutilizáveis de serviços por oficina
- **TemplateServicoItem** — itens do template

O sistema suporta **multi-oficina**, garantindo que cada usuário acesse apenas os dados da sua própria oficina.

---

# Funcionalidades Implementadas

## Autenticação
- Login com JWT
- Proteção de rotas por middleware
- Validação por oficina (`oficinaId` no token)
- Middleware `requireAdmin` e `requireSuperAdmin`
- Rate limiting no login (10 tentativas / 15min)

## CRUD Completo

### Clientes
- Criar, Listar, Atualizar, Deletar

### Veículos
- Criar, Listar, Atualizar, Deletar
- `GET /veiculos/:id/timeline` — histórico cronológico de OS e orçamentos

### Ordens de Serviço (RegistroTecnico)
- Criar com laudo opcional (transação)
- Listar, Detalhe, Atualizar, Deletar
- `PATCH /registroTecnico/:id/status` — troca rápida de status
- Numeração sequencial por oficina

### Laudo de Entrada
- `POST /registroTecnico/:id/laudo` — criar ou substituir laudo
- Avarias com zona, severidade e observação

### Fotos
- `POST /registroTecnico/:id/fotos` — upload via Multer
- `DELETE /registroTecnico/:id/fotos/:fotoId` — remoção com cleanup do arquivo

### Orçamentos
- Sempre vinculado a uma OS (`registroTecnicoId` obrigatório)
- `veiculoId` derivado automaticamente da OS
- Criar com itens, Listar, Detalhe, Atualizar itens, Deletar
- `PATCH /orcamento/:id/status`
- `GET /orcamento/:id/pdf` — gera PDF com logo da oficina (PDFKit)
- Numeração sequencial por oficina

### Templates de Serviços
- `GET|POST /templates` — listar e criar templates da oficina
- `PUT|DELETE /templates/:id` — editar e remover
- Itens com cascade delete

### Oficinas
- `PATCH /oficinas/:id` — editar dados
- `POST /oficinas/:id/logo` — upload de logo (JPG/PNG/WebP, máx 2MB)
- `DELETE /oficinas/:id/logo` — remoção da logo

### Usuários
- `GET|POST /usuarios` — listar e criar
- `PATCH /usuarios/:id` — editar nome, role, ativo
- `POST /usuarios/:id/reset-senha` — redefinir senha

### Dashboard
- `GET /dashboard/summary` — totais e últimos registros

### Busca Global
- `GET /api/search?q=termo` — busca em clientes, veículos, OS e orçamentos

---

# Regras de Negócio

- Usuário só acessa dados da sua própria oficina
- Orçamento sempre pertence a uma OS (jamais órfão)
- `veiculoId` do orçamento é derivado da OS automaticamente
- Status da OS: `Aberta | Em andamento | Aguardando peças | Concluída | Cancelada`
- Status do orçamento: `Pendente | Aprovado | Rejeitado | Executado`
- Remoções críticas em transação (itens + orçamento, avarias + laudo)
- Seed com reset de sequências PostgreSQL para evitar conflito de IDs

---

# Estrutura do Projeto

```
src/
  server.ts
  prisma.ts
  controllers/
    auth.controller.ts
    cliente.controller.ts
    dashboard.controller.ts
    foto.controller.ts
    laudo.controller.ts
    oficina.controller.ts
    orcamento.controller.ts
    orcamentoPdf.controller.ts
    registroTecnico.controller.ts
    template.controller.ts
    usuario.controller.ts
    veiculo.controller.ts
  services/
    laudo.service.ts
    orcamento.service.ts
    registroTecnico.service.ts
    template.service.ts
    veiculo.service.ts
  routes/
    auth.routes.ts
    cliente.routes.ts
    dashboard.routes.ts
    oficina.routes.ts
    orcamento.routes.ts
    public.routes.ts
    registroTecnico.routes.ts
    search.routes.ts
    template.routes.ts
    usuario.routes.ts
    veiculo.routes.ts
  middlewares/
    auth.middleware.ts
  utils/
    rejectManualId.ts

prisma/
  schema.prisma
  seed.ts
  migrations/
    20260305150042_init/
    20260512000001_refatora_os_central/
    20260519000001_add_template_servico/
```

Arquitetura baseada em separação de responsabilidades:

- **Controllers** — Requisição HTTP + validação de entrada
- **Services** — Regras de negócio + acesso ao Prisma
- **Middlewares** — Autenticação e autorização
- **Routes** — Mapeamento de endpoints

---

# Como Rodar o Projeto

## 1 - Instalar dependências
```bash
npm install
```

## 2 - Configurar variáveis de ambiente
```bash
# Criar arquivo .env na raiz
DATABASE_URL="postgresql://usuario:senha@localhost:5432/carbuapp"
JWT_SECRET="sua_chave_secreta"
PORT=3333
SEED_ADMIN_PASSWORD="senha_dos_admins_no_seed"
```

## 3 - Rodar migrations
```bash
npx prisma migrate deploy
```

## 4 - Rodar servidor
```bash
npm run dev
```

## 5 - Health Check
```
GET http://localhost:3333/health
```

## 6 - Popular banco com dados iniciais
```bash
npm run seed
```

---

## Login padrão (Seed)

**1. Buscar oficinas disponíveis:**
```
GET /public/oficinas
```

**2. Fazer login:**
```
POST /auth/login
```
```json
{
  "email": "<email_do_admin>",
  "senha": "<senha_definida_no_SEED_ADMIN_PASSWORD>",
  "oficinaId": 1
}
```

> ⚠️ As credenciais não são publicadas por segurança. Consulte o responsável pelo projeto ou redefina via seed local.

---

# Infraestrutura de Produção

**URL Backend API:** https://api.carbuapp.com.br

```
Frontend (React/Nginx)
        │
        ▼
Backend API (Node.js — Docker)
        │
        ▼
   PostgreSQL (Docker)
```

## Infraestrutura

- VPS Linux (DigitalOcean)
- Docker + docker-compose.prod.yml
- Nginx como reverse proxy
- PostgreSQL em container com volume persistente
- SSL via Let's Encrypt
- Deploy automático via GitHub Actions
- Uploads persistidos via bind mount em `/opt/carbuapp-backend/uploads`

---

# Status Atual do Backend

✔ Autenticação JWT com roles
✔ CRUD completo de todas as entidades
✔ OS como entidade central (laudo, fotos e orçamentos sempre vinculados)
✔ Laudo de entrada com avarias
✔ Upload de fotos nas OS
✔ Templates de serviços reutilizáveis
✔ Geração de PDF com logo da oficina
✔ Busca global
✔ Dashboard com totais e recentes
✔ Timeline do veículo
✔ Multi-oficina com isolamento de dados
✔ Deploy em produção com CI/CD

Backend considerado **MVP funcional completo**.

---

# Frontend do Projeto

O frontend foi desenvolvido com React 19 + TypeScript + Vite.

Repositório:
https://github.com/thiagoprsilva/carbuapp-frontend

---

# Informações Acadêmicas

**Curso:** Análise e Desenvolvimento de Sistemas
**Instituição:** UNASP

Projeto Integrador – 2026/1
