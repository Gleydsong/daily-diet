1. Entendimento do problema
   Precisamos planejar uma API de dieta diária onde cada usuário cadastra e gerencia suas próprias refeições, com autenticação entre requisições e cálculo de métricas de adesão à dieta.
   O plano deve ser pronto para implementação, com decisões fechadas de arquitetura, contratos de API, validação, segurança e testes.

## Estratégia

- Adotar Knex only para acesso a dados, migrações e transações, removendo ambiguidade com Prisma.
- Usar autenticação por JWT em cookie HTTP-only com hook global de autenticação para rotas protegidas.
- Implementar por incrementos: fundação técnica, autenticação, CRUD de refeições, métricas, testes de integração/E2E.
- Garantir robustez com validação de input via Zod, tratamento padronizado de erro e isolamento por user_id em todas as queries.

## Arquitetura

- Camadas e responsabilidades
  - Routes/Controllers: parse da request, chamada de caso de uso, retorno HTTP.
  - Use Cases/Services: regras de negócio (ownership, cálculo de métricas, fluxo de autenticação).
  - Repositories (Knex): queries SQL e transações.
  - Middlewares/Hooks: autenticação por cookie JWT e injeção do userId autenticado.
  - Schemas: validação Zod de params, body e query.

## Fluxo principal

- POST /users cria usuário com senha hash (bcrypt).
- POST /sessions autentica e grava cookie JWT HTTP-only.
- DELETE /sessions remove cookie JWT.
- GET /me retorna dados do usuário autenticado.
- Rotas de refeições exigem cookie válido e usam user_id do token.
- Métricas são calculadas a partir das refeições do usuário autenticado.

## Modelo de dados (mínimo)

users: id (uuid), name, email (unique), password_hash, created_at, updated_at.
meals: id (uuid), user_id (fk users), name, description, occurred_at, is_on_diet, created_at, updated_at.
Índices: meals(user_id), meals(user_id, occurred_at).

## Implementação

- Contratos de API
  - POST /users cria conta.
  - POST /sessions login.
  - POST /meals cria refeição do usuário autenticado.
  - PUT /meals/:id edita refeição somente se pertencer ao usuário.
  - DELETE /meals/:id remove refeição somente se pertencer ao usuário.
  - GET /meals lista refeições do usuário (ordenar por occurred_at desc).
  - GET /meals/:id detalha refeição do usuário.
  - GET /meals/metrics retorna:
    - totalMeals
    - totalOnDiet
    - totalOffDiet
    - bestOnDietStreak (maior sequência cronológica de is_on_diet=true)
- Regras de negócio e segurança
  - Toda query de refeição deve filtrar por id e user_id.
  - Retornar 401 para não autenticado, 404 para recurso inexistente/sem ownership.
  - Padronizar erros em formato único (code, message, details?).
  - Cookie com flags httpOnly, sameSite, secure (em produção), path=/.
  - Validação Zod obrigatória em todos os endpoints.

## 5.Estrutura técnica sugerida

- src/http/routes/\* para rotas por domínio.
- src/http/middlewares/verify-jwt.ts.
- src/use-cases/\* para regras de negócio.
- src/repositories/\* para acesso Knex.
- src/database/migrations/\* e src/database/knex.ts.
- src/lib/env.ts para configuração tipada de ambiente.

## Pontos de atenção

- Cálculo de sequência deve considerar ordenação por occurred_at para evitar métrica incorreta.
- Definir timezone padrão (UTC no banco, conversão no cliente) para evitar inconsistência de data/hora.
- Evitar duplicação de validações entre rota e service; centralizar schemas.
- Melhorias futuras: paginação em GET /meals, refresh token, rate limiting por IP/usuário, auditoria de alterações.

## Testes e critérios de aceite

- Integração: criação de usuário, login, CRUD de refeições, isolamento por usuário, métricas corretas.
- E2E: fluxo completo signup -> login -> create meals -> metrics.
- Casos negativos: token ausente/inválido, payload inválido, acesso a refeição de outro usuário.
- Aceite: 100% dos endpoints funcionais descritos acima, sem vazamento de dados entre usuários, métricas coerentes em cenários reais.

## Assumptions (fechadas)

- Persistência: Knex only.
- Autenticação: JWT em cookie HTTP-only.
- Escopo MVP de testes: Integração + E2E.
- Banco alvo: PostgreSQL.
