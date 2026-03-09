# CarbuApp – Backend  
### Sistema para Oficinas Automotivas  
**Projeto Integrador – UNASP 2026/1**

---

## Sobre o Projeto
O **CarbuApp** é um sistema de gestão em desenvolvimento para oficinas automotivas de pequeno porte, com foco em mecânicos iniciantes e oficinas que ainda não utiliza sistema algum.

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
- Oficinas no geral que trabalham em:
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
- **SQLite (utilizado no desenvolvimento)**
- **PostgreSQL (produção - versão final)**
- **JWT (JSON Web Token)**
- **Docker**

---

## Autenticação

O sistema utiliza **JSON Web Token (JWT)** para:

- Login autenticado
- Proteção de rotas
- Isolamento de dados por oficina

Todas as rotas protegidas exigem:
Authorization: Bearer <token>

---

# Modelagem do Sistema

## Entidades principais:

- Oficina  
- Usuário  
- Cliente  
- DetalheCliente
- Veículo 
- DetalheVeiculo
- Registro Técnico  
- Orçamento  
- Itens de Orçamento  
O sistema suporta multi-oficina, garantindo que cada usuário tenha acesso apenas aos dados da sua própria oficina.
---

# Funcionalidades Implementadas

## Autenticação
- Login com JWT
- Proteção de rotas
- Validação por oficina

## CRUD Completo

### Clientes
- Criar
- Listar
- Atualizar
- Deletar (bloqueia se houver veículos vinculados)

### Veículos
- Criar
- Listar
- Atualizar
- Deletar (bloqueia se houver registros técnicos ou orçamentos)

### Registros Técnicos
- Criar
- Listar
- Atualizar
- Deletar

### Orçamentos
- Criar com múltiplos itens
- Listar
- Atualizar (calcula subtotal e total automaticamente)
- Deletar 
- Gerar PDF profissional (personalizado para cada oficina)

---

# Regras de Negócio Implementadas

- Um usuário só pode acessar dados da sua própria oficina
- Não é possível deletar:
  - Cliente com veículos vinculados
  - Veículo com registros técnicos ou orçamentos
- Orçamento calcula subtotal e total automaticamente no backend
- Remoção de orçamento ocorre em transação (itens + orçamento)
- Todas as rotas protegidas exigem token JWT válido

---

# Estrutura do Projeto

src/
server.ts
prisma.ts
controllers/
services/
routes/
middlewares/

prisma/
schema.prisma
seed.ts
migrations/

Arquitetura baseada em separação de responsabilidades:

- **Controllers** Requisição HTTP
- **Services** Regras de negócio
- **Prisma** Acesso ao banco
- **Middlewares** Autenticação e validações

---

# Como Rodar o Projeto

## 1 - Instalar dependências
npm install
## 2 - Rodar servidor
npm run dev
## 3 - Checar Funcionamento (Health Check)
http://localhost:3333/health
## 4 - Popular banco com dados iniciais
npm run seed

---

## Login padrão (Seed)


**GET /public/oficinas**

Depois faz login:

**POST /auth/login**


- Body exemplo Commenale:

{
  "email": "admin@commenale.local",
  "senha": "admin123",
  "oficinaId": 1
}

- Body exemplo Apocalypse:

{
  "email": "admin@apocalypse.local",
  "senha": "admin123",
  "oficinaId": 2
}


---

# Infraestrutura de Produção
O Sistema está atualmente em produção.

**URL Frontend:https://carbuapp.com.br**
**URL Backend API:https://api.carbuapp.com.br**

Arquitetura de Deploy

Frontend (React)
        │
        ▼
     Nginx
        │
        ▼
Backend API (Node.js)
        │
        ▼
   PostgreSQL

## Infraestrutura

- VPS Linux
- Docker
- Nginx Reverse Proxy
- PostgreSQL (container)
- SSL via Let's Encrypt
- Deploy automático via GitHub Actions

# Status Atual do Backend

✔ Autenticação implementada  
✔ CRUD completo de todas entidades  
✔ Regras de negócio aplicadas  
✔ Geração de PDF 
✔ Validação por oficina  
✔ Deploy em produção
✔ API REST funcional

Backend é considerado um **MVP funcional completo**.

---

# Frontend do Projeto

O frontend do sistema foi desenvolvido utilizando:

- React
- TypeScript
- Vite
- React Router
- Axios

Responsável pela interface visual do sistema, incluindo:

- Dashboard
- Gestão de clientes
- Gestão de veículos
- Registros técnicos
- Sistema de orçamentos
- Geração de PDF

Link do repositório Frontend:
https://github.com/thiagoprsilva/carbuapp-frontend

# Integração do Frontend

O backend foi desenvolvido como  **API REST**, consumida pelo frontend do React.
HTTP + JSON
Com autenticação JWT (JSON Web Token)
Todas as rotas exigem Authorization: Bearer <token>


---

# Informações Acadêmicas

**Aluno:** Thiago Pereira Silva  
**RA:** 060242  
**Turma:** GTADSI53B  
**Curso:** Análise e Desenvolvimento de Sistemas  
**Instituição:** UNASP  


Projeto Integrador – 2026/1


