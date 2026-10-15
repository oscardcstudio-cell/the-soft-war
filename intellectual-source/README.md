# Intellectual Source

Agent Claude de lecture critique pour le **cinéma d'auteur**. Il lit un traitement ou un scénario en cours, nomme ce que le texte fait et ce qu'il refuse, et propose des fins à la manière de quatre cinéastes de référence : Philippe Grandrieux, Lars von Trier, Michael Haneke, Béla Tarr.

Ce n'est pas un script doctor commercial : pas de grille en trois actes, pas de catharsis obligatoire.

## Utilisation

Lancer Claude Code dans ce dossier. Le [`CLAUDE.md`](CLAUDE.md) active l'identité de l'agent, qui charge les fiches et la méthode avant de répondre.

1. **Phase A** : donner un script déjà terminé du cinéaste. L'agent remplit `profil_auteur.md` (modèle : [`profil_auteur.example.md`](profil_auteur.example.md)).
2. **Phase B** : donner le scénario en cours. L'agent produit une lecture critique, quatre propositions de fin sur demande, et des questions dramaturgiques.

Le profil, les scripts et les notes de session restent en local (voir `.gitignore`).

## Contenu

| Dossier | Rôle |
|---|---|
| [`auteurs/`](auteurs/) | Socle théorique du cinéma d'auteur et une fiche par référent |
| [`methode/`](methode/) | Protocoles : lecture critique, propositions de fin, refus dramaturgiques, inventaire des références |
| [`console/`](console/) | Hub web optionnel pour converser à distance avec l'agent (voir ci-dessous) |

## Référents

| Auteur | Geste central | Fin type |
|---|---|---|
| Philippe Grandrieux | Cinéma de la sensation, image dégradée, corps-paysage | Dissolution dans la nuit, l'animal qui surgit |
| Lars von Trier | Sacrifice féminin, contrainte formelle, ironie cosmique | Transcendance par la chute, épilogue séparé |
| Michael Haneke | Plan-séquence fixe, élision, hors-champ moral | Suspension non résolue, refus d'apaisement |
| Béla Tarr | Plan-séquence long, durée comme matière, extinction | Épuisement, lumière qui meurt, circularité |

## Console (optionnelle)

`console/` sert un tableau de bord où une personne munie d'un lien à jeton converse avec l'agent. Un worker tourne sur la machine qui a Claude Code et exécute `claude -p` en headless (paquet [`remote-claude-chat`](https://github.com/oscardcstudio-cell/remote-claude-chat)).

- Agents déclarés dans `console/agents.config.mjs`, dossiers servis dans `console/projects.json` (modèle : `projects.example.json`).
- Secrets en variables d'environnement, jamais dans le repo : `WORKER_TOKEN`, `RCC_TOKENS`, `CLAUDE_CODE_OAUTH_TOKEN` (via `claude setup-token`, valable un an, sans renouvellement automatique), `DATABASE_URL` en production.
- `npm install` puis `npm start` (relais) et `npm run worker` (worker).
