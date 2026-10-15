# MEMORY — The soft War

Mémoire vivante du projet. Lue en premier, mise à jour en fin de chaque session significative.

---

## Index des fichiers structurants

| Fichier | Rôle |
|---|---|
| `CLAUDE.md` | Règles et contexte projet (< 200 lignes) |
| `MEMORY.md` | Ce fichier — mémoire cumulée |
| `llms.txt` | Inventaire des fichiers/dossiers critiques |
| `README.md` | Pitch + setup local |
| `src/app/` | Routes Next.js (admin + public `/p/[slug]` + api) |
| `src/lib/db/` | Drizzle schema + client Postgres |
| `src/lib/auth/` | Lucia magic link |
| `src/lib/queue/` | BullMQ client Redis |
| `src/lib/mastra/` | Mastra config + agents |
| `src/modules/` | 10 modules pipeline (1 dossier par module) |
| `worker/` | Worker BullMQ standalone |
| `drizzle/` | Migrations Drizzle |

---

## Décisions structurelles

| Date | Décision | Raison |
|---|---|---|
| 2026-05-17 | Stack Next.js 16 + Mastra + BullMQ + Drizzle + Lucia | Validée par deepsearch `script_to_dev_app.md` (cf. NBS) |
| 2026-05-17 | Périmètre cercle restreint + URL nanoid + mdp optionnel | Choix Oscar (pas d'inscription publique) |
| 2026-05-17 | Pipeline modulaire dès le départ | Choix Oscar (utilisateur coche les modules) |
| 2026-05-17 | SSR Next.js sur `/p/[slug]` (pas static export) | Le repo se met à jour → tous les dashboards déjà créés suivent |
| 2026-05-17 | Repo public sur GitHub | Choix Oscar (prompts visibles, open-source) |
| 2026-05-17 | Pas de chiffrement app-level des scripts en DB | Choix Oscar (usage perso, pas confidentialité tiers) |
| 2026-05-17 | Prompt caching Anthropic activé dès P1 | 90% cost reduction, ROI après 2-3 scripts (deepsearch) |
| 2026-05-17 | Charte visuelle initiale = celle de NBS (Cormorant + bleu nuit + or) | Évolutive — le repo se met à jour, donc on peut faire évoluer la charte plus tard |
| 2026-05-17 | Mastra > LangGraph pour l'orchestration | TypeScript-first, plus simple à itérer, stack homogène Node |

---

## Gotchas

| # | Gotcha | Origine |
|---|---|---|
| 1 | Le bucket `C:/dev/claude/oscardcstudio/` est un repo git → on a des repos imbriqués. Pattern accepté (cf. Nothing_But_Blue_Sky, Auto_Polymarket). Le `.gitignore` du bucket signale ces sous-repos. | Setup |
| 2 | Subagents Claude Code ne peuvent pas appeler d'autres subagents → orchestration depuis main loop | Deepsearch agents |
| 3 | Bash long (10+ min) sans timeout documenté → pour les jobs Mastra, on passe par BullMQ avec retry/concurrency control | Deepsearch agents |

---

## Sessions

### 2026-05-17 — Phase 1 (init)

**Fait** :
- Repo physique + GitHub créés (`oscardcstudio-cell/the-soft-war`, public)
- Next.js 16 + TS + Tailwind 4 + App Router initialisé
- Dépendances installées : drizzle, lucia, bullmq, mastra, anthropic, mammoth, pdf-parse, fountain-js, resend
- Structure dossiers : `src/app/(admin)/`, `src/app/p/[slug]/`, `src/app/api/`, `src/lib/{db,auth,queue,mastra,utils}/`, `src/modules/{10 modules}/`, `worker/`
- Fichiers d'infra : CLAUDE.md, MEMORY.md, llms.txt, README.md, .env.example, .gitignore

**À faire dans P1** :
- Schema Drizzle initial (users, sessions, projects, project_modules, jobs, shared_links)
- Lucia magic link + Resend
- BullMQ + Redis client + Mastra config skeleton
- Premier commit + push + référencer dans `oscardcstudio/CLAUDE.md`
- Railway provisioning + smoke test `/api/health`

**Phase 2 (P2) — Upload + extraction** : à venir
**Phase 3 (P3) — Pipeline modulaire (10 modules)** : à venir
**Phase 4 (P4) — Dashboard `/p/[slug]`** : à venir
**Phase 5 (P5) — Polish** : à venir

### 2026-10-15 — Bible démo Parasite (consigne changée par Oscar)

- Oscar abandonne le domaine public : film connu et récent. Nosferatu reste sur la branche locale `demo/nosferatu`, non utilisé.
- Projet `projects/jzM3WbGyTz/` = Parasite (Bong Joon Ho, 2019), 8 modules, ancres S{n} = scène. Source : scénario anglais FYC Neon, décrit dans `sources/parasite-2019/SOURCE.md`. Le PDF reste dans `uploads/` (gitignoré) : texte protégé, repo public.
- Citations limitées à 8 répliques d'une ligne (droit de courte citation). Mise en ligne publique = décision d'Oscar (œuvre protégée).
- Gate : branche locale `demo/parasite` NON poussée.

### 2026-10-15 (suite) — Parasite en ligne + Intellectual Source fusionné

- Sur go d'Oscar (relayé) : bible Parasite en charte Mecene (`projects/jzM3WbGyTz/dashboard.html`, agent ui-craft) poussée sur main → Railway.
- `intellectual-source/` = second outil, copie neuve générique sans historique ; le repo d'origine `Intellectual_Source` reste privé et intact. Interdits publics : profil du cinéaste, scripts, notes de session, mémoires tiers, .env, .rcc-*.json (cf. `intellectual-source/.gitignore`).
- Point ouvert : `projects/[id retiré]/` (bible d'un scénario non publié d'un tiers) est public dans ce repo depuis juin. À trancher par Oscar.
