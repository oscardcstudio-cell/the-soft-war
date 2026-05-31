# CLAUDE.md — The soft War

App web qui prend un script de film en entrée et produit toute la bible de développement (worldbuilding, personnages, lieux, pool teaser, fragments, fins, refs, dashboard) sur une **page web partageable**.

## Contexte

Projet perso Oscar de Canecaude. Compte GitHub : `oscardcstudio-cell`.
Repo public : [github.com/oscardcstudio-cell/the-soft-war](https://github.com/oscardcstudio-cell/the-soft-war).

**Inspiration** : le pipeline développé manuellement pour le court métrage *Nothing But Blue Sky* (cf. `C:/dev/claude/oscardcstudio/Nothing_But_Blue_Sky/`). The soft War automatise ce travail pour n'importe quel script.

## Stack

- **Frontend** : Next.js 16 App Router + Tailwind 4 + shadcn/ui
- **Auth admin** : Lucia + magic link (Resend)
- **DB** : Postgres + Drizzle ORM
- **Queue** : Redis + BullMQ
- **Worker** : Node.js standalone (`/worker`)
- **Orchestration LLM** : Mastra (TypeScript-first)
- **LLM** : Anthropic SDK + prompt caching activé
- **Extraction** : mammoth (.docx), pdf-parse (.pdf), fountain-js (.fountain)
- **Render dashboard** : MDX + SSR Next.js (pas de static export → vue toujours à jour)
- **Déploiement** : Railway (4 services : web, worker, redis, postgres)

## Périmètre

- **Toi en admin** (magic link sur ton email)
- **Viewers** via URL nanoid `/p/[slug]` + mdp optionnel par projet
- **Pas d'inscription publique**
- Repo **public**, prompts visibles

## Modules pipeline (modulaire dès départ)

| Module | Input | Output |
|---|---|---|
| `extract` | script (.docx/.pdf/.fountain/.txt) | texte intégral + ancres D{n}.{p} |
| `worldbuilding` | extract | sections 15 strates |
| `characters` | extract | table personnages + traits |
| `locations` | extract | lieux structurants |
| `teaser_pool` | extract | blocs d'images visuelles |
| `fragments` | extract | citations littéraires verbatim |
| `endings` | extract | fins possibles si plusieurs |
| `refs` | extract | cinéma/musique/inspirations |
| `storyboard_analysis` | PDF storyboard optionnel | analyse plan-par-plan |
| `dashboard_render` | tous les modules | HTML MDX final |

L'utilisateur **coche** les modules à lancer. Chaque module est relançable indépendamment.

## Source de vérité

- **`MEMORY.md`** — mémoire vivante (index, décisions, gotchas, sessions). À lire en premier, à jour à chaque session significative.
- **`llms.txt`** — inventaire des fichiers structurants
- **`AGENTS.md`** — instructions pour autres IDE/agents (consume par défaut le CLAUDE.md via `@AGENTS.md` reverse compat)

## Règles

- Commits atomiques par intention (P1.x = phase, module, fix, etc.)
- MEMORY mis à jour en fin de session significative
- Pas de branding SD — projet perso neutre
- Toute idée brute d'Oscar atterrit d'abord dans MEMORY.md avant d'être implémentée
- Prompt caching Anthropic activé dès le départ (le system prompt worldbuilder est stable)
- VR en horizon long terme : ne pas fermer la porte (cf. décision NBS/C6)
- **SSR Next.js** sur `/p/[slug]` (pas static export) : le repo se met à jour, tous les dashboards déjà créés suivent
