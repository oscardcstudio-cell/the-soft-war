# The soft War

> Upload a film script, get the full development bible (worldbuilding, characters, locations, teaser pool, fragments, possible endings, references, dashboard) as a shareable web page.

Built with Next.js 16 + Mastra + Anthropic Claude + BullMQ on Railway.

## What it does

You upload a film script (`.docx`, `.pdf`, `.fountain`, `.txt`), check the modules you want, and the app generates a structured development bible accessible at a shareable URL (`/p/[slug]`).

The pipeline replicates the manual work done for the short film *Nothing But Blue Sky*. Each module is independent and can be re-run individually.

### Modules

| Module | Output |
|---|---|
| `extract` | Raw text with stable anchors `D{n}.{p}` |
| `worldbuilding` | World physics, social classes, geography, paradoxes |
| `characters` | Indexed character table with traits and source anchors |
| `locations` | Structural locations |
| `teaser_pool` | Visual image pool grouped by thematic blocks |
| `fragments` | Notable literary citations (verbatim) |
| `endings` | Possible endings if several are evoked |
| `refs` | Cinema / music / inspirations detected |
| `storyboard_analysis` | Shot-by-shot analysis of an attached storyboard PDF |
| `dashboard_render` | Final HTML/MDX page |

## Stack

- **Frontend** — Next.js 16 App Router + Tailwind 4 + shadcn/ui
- **Auth** — Lucia + magic link via Resend (admin only)
- **DB** — Postgres + Drizzle ORM
- **Queue** — Redis + BullMQ
- **Worker** — Node.js standalone (`/worker`)
- **LLM orchestration** — Mastra (TypeScript-first)
- **LLM** — Anthropic Claude (with prompt caching)
- **Render** — MDX + Next.js SSR (no static export — the repo updates, all dashboards follow)

## Local setup

```bash
# Prereqs : Node 20+, Postgres, Redis (or use docker-compose)

# 1. Install
npm install

# 2. Env vars
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL, REDIS_URL, ANTHROPIC_API_KEY, RESEND_API_KEY

# 3. Migrate DB
npm run db:migrate

# 4. Dev (Next.js)
npm run dev

# 5. Dev (worker, in another terminal)
npm run worker:dev
```

## Deploy (Railway)

Four services :
- `the-soft-war-web` — Next.js
- `the-soft-war-worker` — Node worker
- `the-soft-war-redis` — Redis
- `the-soft-war-db` — Postgres

```bash
railway login
railway link
railway up
```

## License

MIT — but the prompts are the value. Fork freely.

---

Built by [Oscar de Canecaude](https://www.odcstudio.fr/).
