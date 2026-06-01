---
register: product (admin) / brand (public dashboard)
design-read: "Script analysis tool for filmmakers, in cold European editorial language, direction Cahiers du Cinéma typographique"
dials: { variance: 4, motion: 3, density: 6 }
aesthetic: "Cold Editorial — pages intérieures Cahiers du Cinéma fin 90s. Objet de référence: insert de coffret Criterion"
color-strategy: restrained — accent vermillon unique (director's pen mark), warm paper / cool dark

colors:
  paper:       "oklch(97% 0.008 80)"
  paper-2:     "oklch(93% 0.010 78)"
  rule:        "oklch(84% 0.012 75)"
  ink:         "oklch(14% 0.012 60)"
  ink-2:       "oklch(42% 0.010 65)"
  ink-3:       "oklch(60% 0.008 70)"
  accent:      "oklch(52% 0.18 28)"     # vermillon directeur
  accent-ink:  "oklch(98% 0.004 80)"
  # dark mode: paper → oklch(10% 0.015 250) — nuit bleue légère (pont vers le dashboard)

colors-dashboard:
  # Scoped .tsw-dashboard, always dark, cinematic blue-black + gold
  bg:          "oklch(9% 0.018 248)"
  accent:      "oklch(74% 0.090 238)"   # ciel bleu pellicule
  gold:        "oklch(73% 0.098 78)"    # grain pellicule

typography:
  display:        "var(--font-cormorant), Georgia, serif"
  body:           "var(--font-dm-mono), 'Courier New', monospace"
  display-weight: 300
  body-weight:    400
  body-size:      13px

rounded:
  card:   2px   # editorial: tight corners
  button: 2px
  input:  2px

depth-strategy: borders-only — pas de shadow, pas de blur, structure par les règles

macrostructure-last: "Centered Manifesto (home) + Flat Editorial List (admin)"
---

# Notes

- Deux registres distincts : admin = éditorial clair / dashboard = cinéma sombre
- Dark mode admin = nuit bleue froide `oklch(10% 0.015 250)` pour créer un pont visuel avec le dashboard
- Font strategy : DM Mono pour tout le corps/UI (voix typewriter), Cormorant pour les titres (display)
- Le dashboard est toujours dark (prefers-color-scheme ignoré dans .tsw-dashboard)
- Rayon max = 3px — jamais de card ≥ 32px comme interdit
- Accent vermillon `oklch(52% 0.18 28)` = annotation au crayon rouge sur un script
- Accent dashboard `oklch(74% 0.090 238)` = cyan ciel pellicule Kodak
- Tokens Tailwind : bg-paper, text-ink, text-ink-2, text-ink-3, border-rule, text-accent, bg-paper-2, text-success, text-error
