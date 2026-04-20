# GraphQL Backend Starter

Backend foundation for a local-first GraphQL API with:

- Express
- GraphQL
- PostgreSQL
- Sequelize
- Simple JWT auth
- Seed data
- Basic lint, format, test, logging, and metrics setup

## Decisions Locked In

- Integer `id` fields only
- No `company` or `address` modeling for now
- Simple access token auth only for this phase
- Local PostgreSQL using database `graphql-db` and user `postgres`
- Localhost-friendly CORS defaults for frontend development

## Quick Start

1. Copy `.env.example` to `.env`
2. Make sure your local PostgreSQL service is running.
3. In pgAdmin or `psql`, create or confirm:

- Database: `graphql-db`
- User: `postgres`
- Password: the same password you place in `.env`

4. Install packages:

```bash
npm install
```

5. Verify Sequelize can reach your local database:

```bash
npm run db:check
```

6. Run migrations and seed data:

```bash
npm run db:setup
```

7. Start the API:

```bash
npm run dev
```

## Endpoints

- GraphQL: `http://localhost:4000/graphql`
- Health: `http://localhost:4000/health`
- Metrics: `http://localhost:4000/metrics`

## Seed Login

- Email: `owner@localhost.dev`
- Password: `password123`

## Core Scripts

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run test`
- `npm run db:check`
- `npm run db:migrate`
- `npm run db:seed`

## Local PostgreSQL Notes

- This project is local-infra only and does not use Docker.
- pgAdmin is enough to create the database and inspect tables.
- If the connection fails, update `.env` so `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, and `DATABASE_PASSWORD` match your local PostgreSQL instance.
- GraphQL runs at `http://localhost:4000/graphql` by default.
