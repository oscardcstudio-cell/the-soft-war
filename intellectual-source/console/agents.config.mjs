/**
 * agents.config.mjs — registre des AGENTS du hub (non-secret, versionné).
 * Le token d'un pote (table remote_chat_tokens) porte un `project_id` = la clé d'un agent ici.
 * Ajouter un agent = (1) une entrée ici, (2) un dossier CLAUDE.md servi par le worker (projects.json),
 * (3) un token scopé à ce project_id (env RCC_TOKENS).
 *
 *   mode "phases" → dashboard à onglets (1 .md + 1 chat par phase). `phasesSrc` = dossier source des .md.
 *   mode "chat"   → une seule fenêtre de conversation.
 */
export const AGENTS = {
  // Exemple : un scénario travaillé phase par phase. phasesSrc pointe vers le dossier du projet.
  "exemple-scenario": {
    label: "Scénario en cours",
    sub: "cinéma d'auteur · lecture critique",
    accent: "#c8a86b",
    mode: "phases",
    phasesSrc: "../works/exemple-scenario",
    phases: [
      { key: "review",    label: "Review",    file: "REVIEW.md",          conv: "scenario-review",    desc: "Relecture de rigueur — structure + factuel" },
      { key: "critique",  label: "Critique",  file: "CRITIQUE.md",        conv: "scenario-critique",  desc: "Critique de fond — steelman puis faille" },
      { key: "solution",  label: "Solution",  file: "PLAN_CORRECTION.md", conv: "scenario-solution",  desc: "Plan de correction actionnable" },
      { key: "redaction", label: "Rédaction", file: "scenario_v2.md",     conv: "scenario-redaction", desc: "Réécrire à la voix de l'auteur, sur demande" },
    ],
  },
  "philosophe": {
    label: "Le philosophe",
    sub: "interlocuteur — rigueur, citations, courants",
    accent: "#7da3c8",
    mode: "chat",
  },
};

// Vue publique (jamais de secret) exposée au dashboard via /me.
export function publicAgent(projectId) {
  const a = AGENTS[projectId];
  if (!a) return null;
  const { phasesSrc, ...pub } = a;
  return { projectId, ...pub };
}
