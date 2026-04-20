# Backend Codex Prompt (Express + PostgreSQL + Sequelize)

Use this document as the **exact working prompt** for a backend-focused Codex agent. It is written to align with the current frontend contract in this repository.

## 1) Mission
Build a production-minded backend using:
- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- JWT authentication
- bcrypt password hashing

Primary goal: implement a backend that works with the existing frontend GraphQL data layer **without breaking current query/mutation contracts**.

## 2) Frontend Contract You Must Preserve
The frontend currently uses Apollo Client and expects a GraphQL endpoint (`VITE_GRAPHQL_API_URL`).

### Required operations
- `GetUsers($options: PageQueryOptions)`
- `GetUserById($id: ID!)`
- `CreateUser($input: CreateUserInput!)`
- `UpdateUserById($id: ID!, $input: UpdateUserInput!)`
- `DeleteUserById($id: ID!)`
- `GetPosts($options: PageQueryOptions)`
- Optional/next: `GetPostsWithComments($options: PageQueryOptions)`

### Required query options input behavior
Support at least these fields from `PageQueryOptions`:
- `paginate.page` (1-based)
- `paginate.limit`
- `search.q`
- `sort.field`
- `sort.order` (`ASC` | `DESC`)

Also include schema fields for:
- `slice`
- `operators`
(They can be implemented as no-op initially if not used yet, but schema should contain them.)

### Required response envelope for list queries
For `users(options)` and `posts(options)`, return:
- `meta.totalCount`
- `links.first/prev/next/last` where each link has `page` and `limit`
- `data` array

### Required data shapes (minimum)
`User` must include:
- `id`, `name`, `username`, `email`, `phone`, `website`
- `company { name catchPhrase bs }`
- `address { city street suite zipcode geo { lat lng } }`

`Post` must include:
- `id`, `title`, `body`
- `user { id name username email }`
- `comments { data { id name email body } }` (needed for `GetPostsWithComments`)

## 3) Backend Architecture Requirements
Implement GraphQL on Express (Apollo Server integration is acceptable).

### Recommended package set
- `express`
- `@apollo/server` + Express integration package
- `graphql`
- `sequelize`
- `pg`, `pg-hstore`
- `dotenv`
- `cors`
- `helmet`
- `morgan`
- `bcrypt` (or `bcryptjs`)
- `jsonwebtoken`
- `zod` (or Joi) for runtime validation

### Suggested structure
- `backend/src/app.ts`
- `backend/src/server.ts`
- `backend/src/config/*`
- `backend/src/db/models/*`
- `backend/src/db/migrations/*`
- `backend/src/db/seeders/*`
- `backend/src/graphql/schema/*`
- `backend/src/graphql/resolvers/*`
- `backend/src/modules/auth/*`
- `backend/src/utils/*`

## 4) Data Modeling Guidance (Sequelize)
Model at least:
- `User`
- `Company` (or JSONB in User)
- `Address` (or JSONB in User)
- `Post`
- `Comment`
- `AuthAccount` (or add auth fields in User table)
- `RefreshToken` (if refresh flow is implemented)

Minimum relationship expectations:
- User has many Posts
- Post belongs to User
- Post has many Comments
- Comment belongs to Post

## 5) Auth Requirements (JWT + bcrypt)
Implement auth module even if frontend wires it in a later step.

### Required auth features
- Register: hash password with bcrypt
- Login: verify password and issue JWT
- Optional refresh token flow
- `me` query (or equivalent) to fetch authenticated profile

### Security baseline
- Never store plain passwords
- Add JWT expiry
- Add request auth middleware/context parsing
- Add `helmet` + strict CORS allowlist
- Sanitize and validate inputs

## 6) GraphQL Schema Requirements
Design schema so current frontend operations work as-is.

### Pagination and links
Implement helper to compute:
- `first = { page: 1, limit }`
- `prev = page > 1 ? { page - 1, limit } : null`
- `next = page < lastPage ? { page + 1, limit } : null`
- `last = { page: lastPage, limit }`

### Sorting safety
Whitelist sortable fields:
- Users: `id`, `name`, `username`, `email`, `phone`, `website`, `company.name`
- Posts: `id`, `title`, `body`, `user.name`, `user.username`

Reject unknown sort fields with a clear GraphQL error.

### Search behavior
Global `search.q` should match relevant text columns (case-insensitive):
- Users: name, username, email, phone, website, company name
- Posts: title, body, author name, author username

## 7) Implementation Phases
### Phase 1: Foundation
- Initialize backend workspace
- Configure TypeScript, linting, env parsing
- Connect Sequelize to PostgreSQL
- Add migrations + seed data

### Phase 2: GraphQL Domain (Users + Posts)
- Create schema types and inputs
- Build resolvers for required operations
- Implement paging/search/sort utilities
- Ensure response envelope matches frontend expectations

### Phase 3: Auth
- Add register/login/me
- Add bcrypt + JWT
- Add optional route/resolver guards

### Phase 4: Quality + Hardening
- Add unit tests for query utility logic
- Add integration tests for GraphQL operations
- Add error formatter and structured logs
- Add README setup instructions

## 8) Acceptance Criteria (Must Pass)
- Existing frontend user list works with pagination/search/sort.
- Existing frontend user create/update/delete works.
- Existing frontend posts list works with pagination/search/sort.
- GraphQL responses include `meta`, `links`, and `data` exactly as expected.
- No SQL injection risk in sort/search handling.
- Passwords are hashed, JWT works, and auth errors are explicit.

## 9) Non-Negotiables
- Do not break existing GraphQL operation names or field names.
- Do not remove currently expected nullable fields.
- Do not introduce hidden magic; keep modules explicit and maintainable.
- Prefer clear, tested utilities for pagination/search/sort.

## 10) Execution Style for Backend Codex
When executing this prompt:
- First, print a concrete file-by-file implementation plan.
- Then implement in small commits/steps with clear diffs.
- After each phase, run tests or smoke queries.
- At the end, provide:
  - list of files created/edited
  - migration and seed commands
  - run commands
  - sample GraphQL operations for verification

## 11) Copy-Paste Master Prompt
Use the text below directly with your backend Codex agent.

```txt
You are building the backend for an existing frontend project.

Tech requirements:
- Node.js + Express.js
- PostgreSQL + Sequelize ORM
- GraphQL API compatible with Apollo Client frontend
- JWT auth + bcrypt password hashing

Critical rule:
Preserve frontend GraphQL contracts exactly. Do not rename existing operations, types, or response field structures currently expected by frontend queries/mutations.

Implement these operations:
- GetUsers(options: PageQueryOptions)
- GetUserById(id: ID!)
- CreateUser(input: CreateUserInput!)
- UpdateUserById(id: ID!, input: UpdateUserInput!)
- DeleteUserById(id: ID!)
- GetPosts(options: PageQueryOptions)
- GetPostsWithComments(options: PageQueryOptions) [optional but recommended]

For users/posts list responses, always return:
- meta { totalCount }
- links { first prev next last } with page/limit pairs or null
- data []

Support PageQueryOptions fields:
- paginate.page, paginate.limit
- search.q (case-insensitive global search)
- sort.field, sort.order (ASC/DESC) with whitelist validation
- include slice/operators in schema even if initially no-op

Sorting whitelist:
- Users: id, name, username, email, phone, website, company.name
- Posts: id, title, body, user.name, user.username

Search scope:
- Users: name, username, email, phone, website, company name
- Posts: title, body, author name, author username

Auth requirements:
- register/login/me
- password hashing with bcrypt
- JWT issuance and validation
- secure defaults (helmet, CORS allowlist, env validation)

Execution requirements:
1) Start with file-by-file plan.
2) Implement in phases (foundation -> domain -> auth -> tests).
3) Provide migration + seed scripts.
4) Add tests for pagination/sort/search behavior and core resolvers.
5) End with run instructions and sample GraphQL requests for verification.

Quality bar:
- Maintainable architecture
- Explicit error messages
- Input validation and security baseline
- Frontend compatibility first
```
