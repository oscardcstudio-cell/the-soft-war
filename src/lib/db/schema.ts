import { pgTable, text, timestamp, boolean, jsonb, integer, uuid, index } from "drizzle-orm/pg-core";

// ─────────────────────────────────────────────────────────────────────────────
// AUTH (Lucia)
// ─────────────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const magicLinks = pgTable("magic_links", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  consumedAt: timestamp("consumed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("magic_links_email_idx").on(t.email),
]);

// ─────────────────────────────────────────────────────────────────────────────
// PROJECTS
// ─────────────────────────────────────────────────────────────────────────────

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: text("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  // Slug nanoid pour l'URL publique /p/[slug]
  slug: text("slug").notNull().unique(),
  // Mot de passe optionnel (bcrypt hash) pour protéger l'URL publique
  passwordHash: text("password_hash"),
  // Script source uploadé
  scriptFilename: text("script_filename").notNull(),
  scriptMimeType: text("script_mime_type").notNull(),
  // Stockage du script (texte brut une fois extrait + metadata)
  scriptBytes: integer("script_bytes").notNull(),
  scriptText: text("script_text"), // Texte extrait après module 'extract'
  // Storyboard PDF optionnel (chemin si stocké, ou null)
  storyboardFilename: text("storyboard_filename"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("projects_owner_idx").on(t.ownerId),
  index("projects_slug_idx").on(t.slug),
]);

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT MODULES (résultats par module pipeline)
// ─────────────────────────────────────────────────────────────────────────────

export type ModuleName =
  | "extract"
  | "worldbuilding"
  | "characters"
  | "locations"
  | "teaser_pool"
  | "fragments"
  | "endings"
  | "refs"
  | "storyboard_analysis"
  | "dashboard_render";

export type ModuleStatus = "pending" | "running" | "completed" | "failed";

export const projectModules = pgTable("project_modules", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  // Nom du module (extract, worldbuilding, characters, etc.)
  module: text("module").$type<ModuleName>().notNull(),
  status: text("status").$type<ModuleStatus>().notNull().default("pending"),
  // Markdown généré par le module
  markdown: text("markdown"),
  // Données structurées (sections, ancres, etc.)
  data: jsonb("data"),
  // Erreur si status=failed
  error: text("error"),
  // Tokens consommés (input + output) pour ce module
  tokensInput: integer("tokens_input").default(0),
  tokensOutput: integer("tokens_output").default(0),
  tokensCacheRead: integer("tokens_cache_read").default(0),
  tokensCacheWrite: integer("tokens_cache_write").default(0),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("project_modules_project_idx").on(t.projectId),
  index("project_modules_status_idx").on(t.status),
]);

// ─────────────────────────────────────────────────────────────────────────────
// JOBS (tracking BullMQ)
// ─────────────────────────────────────────────────────────────────────────────

export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  // BullMQ job ID
  bullJobId: text("bull_job_id").notNull(),
  module: text("module").$type<ModuleName>().notNull(),
  status: text("status").$type<ModuleStatus>().notNull().default("pending"),
  attempts: integer("attempts").notNull().default(0),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("jobs_project_idx").on(t.projectId),
  index("jobs_bull_idx").on(t.bullJobId),
]);

// ─────────────────────────────────────────────────────────────────────────────
// Types helpers
// ─────────────────────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ProjectModule = typeof projectModules.$inferSelect;
export type Job = typeof jobs.$inferSelect;
