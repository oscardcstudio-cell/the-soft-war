import type { ModuleName } from "@/lib/db/schema";

export type ModuleDefinition = {
  name: ModuleName;
  label: string;
  description: string;
  // Modules that must succeed before this one can run.
  dependsOn: ModuleName[];
  // Whether this module is selectable by default in the UI.
  defaultEnabled: boolean;
};

export const MODULES: Record<ModuleName, ModuleDefinition> = {
  extract: {
    name: "extract",
    label: "Extract",
    description: "Extracts raw text from the script, indexes with stable anchors D{n}.{p}.",
    dependsOn: [],
    defaultEnabled: true,
  },
  worldbuilding: {
    name: "worldbuilding",
    label: "Worldbuilding",
    description: "World physics, social classes, geography, economy, history, paradoxes.",
    dependsOn: ["extract"],
    defaultEnabled: true,
  },
  characters: {
    name: "characters",
    label: "Characters",
    description: "Character table with names, roles, traits, source anchors.",
    dependsOn: ["extract"],
    defaultEnabled: true,
  },
  locations: {
    name: "locations",
    label: "Locations",
    description: "Structural locations of the story.",
    dependsOn: ["extract"],
    defaultEnabled: true,
  },
  teaser_pool: {
    name: "teaser_pool",
    label: "Teaser pool",
    description: "Visual image pool grouped by thematic blocks (A→N).",
    dependsOn: ["extract"],
    defaultEnabled: true,
  },
  fragments: {
    name: "fragments",
    label: "Fragments",
    description: "Notable literary citations preserved verbatim.",
    dependsOn: ["extract"],
    defaultEnabled: true,
  },
  endings: {
    name: "endings",
    label: "Possible endings",
    description: "Lists possible endings if several are evoked in the script.",
    dependsOn: ["extract"],
    defaultEnabled: false,
  },
  refs: {
    name: "refs",
    label: "References",
    description: "Cinema / music / inspirations detected in the script.",
    dependsOn: ["extract"],
    defaultEnabled: true,
  },
  storyboard_analysis: {
    name: "storyboard_analysis",
    label: "Storyboard analysis",
    description: "Shot-by-shot analysis if a storyboard PDF was attached.",
    dependsOn: ["extract"],
    defaultEnabled: false,
  },
  dashboard_render: {
    name: "dashboard_render",
    label: "Dashboard render",
    description: "Final HTML/MDX page assembling all selected modules.",
    dependsOn: ["worldbuilding", "characters"],
    defaultEnabled: true,
  },
};

export const MODULE_ORDER: ModuleName[] = [
  "extract",
  "worldbuilding",
  "characters",
  "locations",
  "teaser_pool",
  "fragments",
  "endings",
  "refs",
  "storyboard_analysis",
  "dashboard_render",
];
