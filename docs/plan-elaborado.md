# Plano de Execução — Salvar Planejamento e Implementar API

## Resumo
Vamos primeiro registrar o planejamento elaborado em `docs/plan-elaborado.md` para preservar o contexto atual do projeto, e só depois iniciar a implementação incremental da API Daily Diet conforme esse plano.

## Mudanças de implementação
1. Criar o arquivo `docs/plan-elaborado.md` com o plano técnico consolidado (arquitetura, fases, contratos, testes e premissas).
2. Manter `plan.md` sem sobrescrita, como você pediu para evitar quebra de contexto.
3. Iniciar implementação por fases:
- Fundação técnica: Fastify, Knex, PostgreSQL, env tipado, erro global, auth plugin.
- Domínio e dados: migrations `users` e `meals`, índices, repositories e use-cases.
- API REST: `users`, `sessions`, `meals` (CRUD + métricas), validação Zod e ownership.
- Testes: integração e E2E cobrindo auth, isolamento por usuário e métricas.

## APIs/interfaces afetadas
- Endpoints públicos REST:
- `POST /users`
- `POST /sessions`
- `POST /meals`
- `PUT /meals/:id`
- `DELETE /meals/:id`
- `GET /meals`
- `GET /meals/:id`
- `GET /meals/metrics`
- Mecanismo de autenticação: JWT em cookie HTTP-only.

## Testes e cenários
- Fluxo E2E principal: cadastro -> login -> criação/listagem/edição/exclusão de refeições -> métricas.
- Casos de segurança: sem token, token inválido, acesso a recurso de outro usuário.
- Casos de domínio: melhor sequência dentro da dieta (streak), zero refeições, somente fora/somente dentro.

## Assumptions
- Persistência única: Knex + PostgreSQL.
- Stack: Node.js + Fastify + TypeScript + Zod + JWT + Bcrypt.
- Escopo inicial de qualidade: testes de integração e E2E.
- Arquivo de planejamento oficial desta etapa: `docs/plan-elaborado.md`.
