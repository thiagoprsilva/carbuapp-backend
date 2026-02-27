# CarbuApp – Backend  
### Sistema para Oficinas Automotivas  
**Projeto Integrador – UNASP 2026/1**

---

## Sobre o Projeto
O **CarbuApp** é um sistema de gestão para oficinas automotivas de pequeno porte, desenvolvido com foco em preparadores iniciantes e oficinas que ainda não utiliza sistema algum.

O objetivo é oferecer uma solução:

- Simples  
- De baixo custo  
- Organizada  
- Voltada para controle técnico de veículos  
- Com geração automática de orçamentos em PDF  

Cliente de referência: **Commenale Motorsports**, **Apocalypse Custom**

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
- **SQLite**
- **JWT (JSON Web Token)**

---

## Autenticação

O sistema utiliza **JSON Web Token (JWT)** para:

- Controle de sessão
- Proteção de rotas
- Isolamento por oficina (multi-oficina)

Todas as rotas protegidas exigem:
Authorization: Bearer <token>

---

# Modelagem do Sistema

## Entidades principais:

- Oficina  
- Usuário  
- Cliente  
- Veículo  
- Registro Técnico  
- Orçamento  
- Itens de Orçamento  

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
- Atualizar (recalcula subtotal e total automaticamente)
- Deletar (remove itens em transação)
- Gerar PDF profissional alinhado

---

# Regras de Negócio Implementadas

- Um usuário só pode acessar dados da sua própria oficina
- Não é possível deletar:
  - Cliente com veículos vinculados
  - Veículo com registros técnicos ou orçamentos
- Orçamento recalcula subtotal e total automaticamente no backend
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

- **Controller** Requisição HTTP
- **Service** Regras de negócio
- **Prisma** Acesso ao banco
- **Middleware** Autenticação e validações

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

- Email: `admin@carbuapp.local`
- Senha: `admin123`

---

# Status Atual do Backend

✔ Autenticação implementada  
✔ CRUD completo de todas entidades  
✔ Regras de negócio aplicadas  
✔ Geração de PDF alinhada  
✔ Validação por oficina  
✔ Versionamento no GitHub  

Backend considerado **MVP funcional completo**.

---

# Próxima Etapa

- Desenvolvimento do Frontend (React + TypeScript)
- Interface visual
- Integração com API
- Fluxo completo para apresentação

---

# Informações Acadêmicas

**Aluno:** Thiago Pereira Silva  
**RA:** 060242  
**Turma:** GTADSI53B  
**Curso:** Análise e Desenvolvimento de Sistemas  
**Instituição:** UNASP  


Projeto Integrador – 2026/1