# carbuapp-backend
# CarbuApp - Commenale Motorsports

O CarbuApp é um sistema facilitador para oficinas automotivas de pequeno porte, feito para ajudar preparadores iniciantes e oficinas de pequeno porte.

O objetivo é oferecer uma solução simples, de baixo custo e organizada para controle de clientes, veículos, registros técnicos e geração de orçamentos em PDF.

Projeto desenvolvido como parte do :
**Projeto Integrador do curso de Análise e Desenvolvimento de Sistemas da UNASP 2026/1.**
**Aluno: Thiago Pereira Silva**


# Público-Alvo

Oficinas automotivas de pequeno porte, especialmente para mecânicos que ainda não trabalham com nenhum sistema, o CarbuApp atende:

- Carros Originais
- Projetos turbo
- Projetos stage
- Preparações personalizadas

Cliente de referência: **Commenale Motorsports**

---

# Arquitetura

**Backend**
- Node.js
- Express
- TypeScript
- Prisma ORM
- SQLite

**Autenticação**
- JWT (JSON Web Token)

**Banco de Dados**
- SQLite (ambiente de desenvolvimento)

---

**Estrutura do Projeto**

src/
server.ts
prisma.ts

prisma/
schema.prisma
seed.ts
migrations/

**Modelagem do Sistema**

Entidades principais:

- Oficina
- Usuário
- Cliente
- Veículo
- Registro Técnico
- Orçamento
- Itens de Orçamento

# Como rodar o projeto ?

**1 - Instalar dependências:**
npm install
**2 - Rodar servidor:**
npm run dev
**3 - Acessar no navegador Prisma:**
http://localhost:3333/health
**Seed Inicial - Popular o banco com dados iniciais:**
npm run seed

Login padrão criado pelo seed:

- Email: admin@carbuapp.local
- Senha: admin123


# Fluxo de Desenvolvimento

1. Abrir o projeto no VS Code
2. Rodar `npm run dev`
3. Implementar funcionalidades
4. Testar via Thunder Client
5. Commitar alterações com Git

---

#  Roadmap do Projeto

**Fase 1 (Concluída)**
- Setup inicial do backend
- Configuração do Prisma
- Banco SQLite criado
- Seed inicial funcionando
- Versionamento no GitHub

**Próximas Fases**
- Implementação de autenticação (JWT)
- CRUD de Clientes
- CRUD de Veículos
- Registro Técnico
- Sistema de Orçamento
- Geração de PDF
- Integração com Frontend React



# Autor

**Thiago Pereira Silva  RA: 060242**
**Turma: GTADSI53B**
Projeto acadêmico – UNASP