# Code Connect API

API de autenticação do Code Connect. NestJS 12 (ESM), com Swagger, JWT,
PostgreSQL e TypeORM. Os usuários são persistidos na tabela `users`; o schema
é versionado por migrations que rodam no boot da aplicação.

## Como rodar

```bash
pnpm install       # na raiz do monorepo
pnpm db:up         # sobe o PostgreSQL em Docker
pnpm api:dev       # http://localhost:3000
```

O `compose.yaml` da raiz sobe o Postgres na porta `5432` e usa o volume nomeado
`postgres_data`, então os dados continuam existindo após reiniciar a API ou o
container. Para parar sem apagar os dados, use `pnpm db:down`. Para apagar o
volume e recriar o banco do zero, use `pnpm db:reset`.

Variáveis de ambiente (copie `apps/api/.env.example` para `apps/api/.env`):

| Variável | Padrão | Descrição |
|---|---|---|
| `PORT` | `3000` | Porta da API |
| `JWT_SECRET` | chave de desenvolvimento | Segredo do JWT. Obrigatório em produção (mín. 32 caracteres) |
| `JWT_EXPIRES_IN` | `1h` | Validade do access token (`30m`, `1h`, `7d` ou segundos) |
| `WEB_ORIGIN` | `http://localhost:5173` | Origem permitida no CORS (várias separadas por vírgula) |
| `DATABASE_HOST` | `localhost` | Host do PostgreSQL |
| `DATABASE_PORT` | `5432` | Porta do PostgreSQL |
| `DATABASE_USER` | `code_connect` | Usuário do banco |
| `DATABASE_PASSWORD` | `code_connect` | Senha do banco |
| `DATABASE_NAME` | `code_connect` | Nome do banco |

Em produção, `DATABASE_HOST`, `DATABASE_USER`, `DATABASE_PASSWORD` e
`DATABASE_NAME` são obrigatórios, sem os defaults de desenvolvimento.

## Banco de dados

- **TypeORM** mapeia a entidade `User` para a tabela `users`.
- A migration inicial fica em `src/database/migrations/` e roda
  automaticamente no boot (`migrationsRun: true`).
- `synchronize` fica desligado: mudanças de schema devem entrar por migration.
- A constraint única de `email` protege contra cadastros duplicados, inclusive
  em requisições concorrentes. A violação (`23505`) vira `409 Conflict`.
- O e-mail é normalizado para minúsculas antes de ser salvo e consultado.

### Testes de integração

Os testes e2e usam o banco `code_connect_test`, criado pelo script
`docker/postgres/init/01-create-test-db.sql` na primeira inicialização do
volume. Cada cenário limpa a tabela `users` antes de rodar. Se o volume já
existia antes desse script, recrie-o com `pnpm db:reset`.

## Endpoints

| Método | Rota | Auth | Sucesso | Erros |
|---|---|---|---|---|
| `POST` | `/users` | não | `201` usuário criado | `400` dados inválidos · `409` e-mail duplicado |
| `POST` | `/auth/login` | não | `200` access token + usuário | `400` dados inválidos · `401` credenciais inválidas |
| `GET` | `/auth/me` | sim | `200` dados do usuário logado | `401` token ausente, inválido ou expirado |

```bash
# cadastrar
curl -X POST http://localhost:3000/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"Maria Souza","email":"maria.souza@email.com","password":"SenhaForte1"}'

# login
curl -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"maria.souza@email.com","password":"SenhaForte1"}'

# dados do usuário logado
curl http://localhost:3000/auth/me -H 'Authorization: Bearer <access_token>'
```

A senha nunca volta na resposta: o registro interno guarda apenas o hash
bcrypt. O e-mail é normalizado para minúsculas e precisa ser único.

## Swagger

`http://localhost:3000/docs` documenta os bodies de entrada e de saída
(`CreateUserDto`, `LoginDto`, `UserResponseDto`, `LoginResponseDto`), os status
de erro e o esquema `Bearer` do Swagger UI. O JSON bruto fica em
`http://localhost:3000/docs-json`.

## Testes

```bash
pnpm api:test        # unitários (*.spec.ts), sem banco
pnpm api:test:e2e    # e2e (test/*.e2e-spec.ts), requer o Postgres de teste
```

Os testes unitários usam um repositório fake em memória. Os e2e sobem o
`AppModule` completo contra o `code_connect_test` e precisam do container
rodando (`pnpm db:up`).

---

## NestJS

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Observability

In production applications, observability is essential for understanding how your system behaves, detecting issues early, and maintaining reliable performance.

[NestJS Observe](https://observe.nestjs.com) automatically instruments your NestJS application, giving you deep visibility into your system with minimal setup:

- **Distributed tracing:** Follow requests across services and understand how they flow through your system.
- **Waterfall analysis:** Visualize request execution and identify slow operations, bottlenecks, and unexpected delays.
- **Performance analysis:** Analyze application performance in real time and quickly pinpoint areas that need optimization.
- **Metrics:** Track key application and infrastructure metrics to understand system health and performance trends.
- **Logging:** Centralize and correlate logs with traces and other telemetry to make debugging easier.
- **Error tracking:** Detect errors quickly and investigate their root causes with the surrounding context.
- **SLA monitoring:** Track service-level objectives and identify when your application is approaching or exceeding defined thresholds.
- **Alarms and alerts:** Set up alerts for critical errors, performance degradation, SLA violations, and other anomalies so your team can react quickly.

To add it to this project:

```bash
$ pnpm install @nestjs/observe
```

Then follow the [setup guide](https://docs.nestjs.com/observability/overview) - it takes a single import and an app key.

The free plan needs no payment details and covers 300,000 events a month. You can also browse the [live demo](https://www.observe-demo.nestjs.com/dashboard) first - the whole dashboard over a busy service's data, with nothing to install.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Auto-instrument your application with [NestJS Observe](https://observe.nestjs.com). Distributed tracing, metrics, and logging made easy. Error tracking and performance monitoring for your NestJS applications.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
