# Cadre — inventaire des références

> Outil du pipeline ([`pipeline_corpus.md`](pipeline_corpus.md)), entre **REVIEW** et **REFACTOR** :
> un corpus exigeant tient ou tombe sur son **appareil de références**. Ce cadre inventorie, pour
> chaque référence (texte théorique, œuvre, citation, attribution), **ce qui manque et l'action**.
> Décline sur tout domaine : une thèse cite des auteurs/concepts, un film cite des œuvres/influences.

## Règle d'or du cadre

**Jamais inventer une référence, une page, une date, un éditeur.** Une réf non vérifiée = statut
`à sourcer` ou `à vérifier`, pas une affabulation. Toute correction s'appuie sur une source citée (URL/édition).

## Les 6 statuts d'une référence

| Statut | Sens | Action type |
|---|---|---|
| ✅ `complète` | citée, exacte, sourçable | rien (garder) |
| 🟠 `à compléter` | citée mais incomplète (page, édition, date) | caler l'info manquante |
| 🔴 `à réattribuer` | attribuée au mauvais auteur/œuvre | corriger l'attribution |
| 🟡 `à sourcer` | mobilisée mais sans source vérifiable | trouver la source ou requalifier en paraphrase |
| ⚪ `à vérifier` | existence/exactitude douteuse | confirmer ou retirer |
| ➕ `absente — à ajouter` | nécessaire à l'argument, **pas dans le corpus** | ajouter (souvent la racine généalogique manquante) |

## Colonnes de l'inventaire

`réf (telle que citée)` · `type` (théorie / œuvre / citation / attribution) · `statut` · `problème`
(1 ligne) · `action` (ce qu'il faut faire) · `cible/source` (la bonne réf + URL).

## Méthode (3 passes)

1. **Extraire** toutes les réfs du corpus (auteurs, concepts nommés, œuvres, citations directes).
2. **Statuer** chacune contre les 6 statuts — croiser avec la vérif factuelle (`verification.md` ou équivalent).
3. **Prioriser** : d'abord les `à réattribuer` (erreur intellectuelle = la plus coûteuse devant un jury),
   puis les `absente — à ajouter` (généalogie manquante = faille de lecture), puis le reste.

> L'inventaire rempli d'un corpus vit dans `works/<slug>/refs_manquantes.md`.
