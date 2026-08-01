# Mess Feedback API

Next.js (App Router) backend for the Mess Feedback System, backed by Prisma
Postgres. Replaces the previous Express + MySQL server in `../Backend`.

## Endpoints

All routes live under `/api`.

| Method | Path | Access |
| --- | --- | --- |
| GET | `/api/test` | public |
| POST | `/api/auth/student/register` | public |
| POST | `/api/auth/student/login` | public |
| POST | `/api/auth/admin/register` | public |
| POST | `/api/auth/admin/login` | public |
| POST | `/api/auth/logout` | public |
| GET | `/api/auth/check-auth` | public |
| POST | `/api/feedback/submit` | any logged-in user |
| GET | `/api/feedback/:id` | owner or admin |
| GET | `/api/feedback/admin/all` | admin |
| GET | `/api/feedback/filter` | admin |
| GET | `/api/feedback/export/pdf` | admin |
| GET | `/api/feedback/export/excel` | admin |

`/api/feedback/filter` and both export routes accept the query parameters
`student_reg_no`, `mess_name`, `block_name`, `start_date`, `end_date`
(`YYYY-MM-DD`).

## Authentication

Login returns a signed JWT:

```json
{ "message": "...", "user": { "id": 1, "type": "admin", "name": "..." }, "token": "eyJ..." }
```

Send it on every authenticated request:

```
Authorization: Bearer <token>
```

There is no server-side session. That is deliberate — serverless instances do
not share memory, so `express-session`'s in-memory store could not work on
Vercel. Tokens are valid for 7 days; logging out just discards the token
client-side.

## Environment variables

Copy `.env.example` to `.env` for local work, and set the same keys under
**Project Settings → Environment Variables** on Vercel.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | Prisma Postgres connection string, or any `postgresql://` URL |
| `JWT_SECRET` | yes | Signs login tokens. Long random string |
| `ALLOWED_ORIGINS` | recommended | Comma-separated frontend origins allowed to call the API. Any origin is allowed when unset |
| `REPORT_TIMEZONE` | no | Timezone for the weekly/monthly counts and date filters. Defaults to `Asia/Kolkata` |

Both required variables are read at startup and the process fails immediately
with a descriptive error if either is missing — including during the Vercel
build, so set them before deploying.

## Creating a database

Each project needs its own Prisma Postgres database — do not reuse a key across
projects, since they would share tables.

1. Open the [Prisma Console](https://console.prisma.io).
2. **New project** → name it (for example `mess-feedback`) → pick a region.
3. Open the project's database and click **Generate database credentials** /
   **Create API key**.
4. Copy the `prisma+postgres://accelerate.prisma-data.net/?api_key=...` string
   into `DATABASE_URL`.

The key is shown once. If you lose it, generate a new one — old keys can be
revoked from the same screen.

## Local development

```bash
npm install
cp .env.example .env    # then fill in DATABASE_URL and JWT_SECRET
npm run db:push         # create the tables
npm run seed            # optional: load the rows from the old MySQL dump
npm run dev             # http://localhost:8080
```

`npx prisma dev` starts a local Postgres if you would rather not use a hosted
database while developing.

## Useful scripts

| Script | Does |
| --- | --- |
| `npm run dev` | Dev server on port 8080 |
| `npm run build` | `prisma generate` + `next build` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:push` | Apply `prisma/schema.prisma` to the database |
| `npm run db:studio` | Browse the data in Prisma Studio |
| `npm run seed` | Load the original rows (idempotent) |

## Deploying to Vercel

Create a Vercel project from this repository with **Root Directory** set to
`server`. Everything else is detected automatically. Add the environment
variables above, deploy, then point the frontend's `PRODUCTION_API_URL` in
`../frontend/script.js` at `https://<your-deployment>.vercel.app/api`.
