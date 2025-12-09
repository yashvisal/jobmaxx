import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").unique().notNull(),
  email: text("email"),
  
  // Education
  school: text("school"),
  graduationYear: integer("graduation_year"),
  major: text("major"),
  
  // Professional
  resumeText: text("resume_text"),
  resumeFileUrl: text("resume_file_url"),
  linkedinUrl: text("linkedin_url"),
  targetRoles: text("target_roles").array(),
  targetIndustries: text("target_industries").array(),
  skills: text("skills").array(),
  
  // Extra
  clubs: text("clubs").array(),
  activities: text("activities").array(),
  extraInfo: text("extra_info"),
  
  // Meta
  onboardingComplete: boolean("onboarding_complete").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const threads = pgTable("threads", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  jobUrl: text("job_url"),
  company: text("company"),
  role: text("role"),
  status: text("status").default("analyzing"), // 'analyzing' | 'complete' | 'error'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  threadId: integer("thread_id").references(() => threads.id).notNull(),
  role: text("role").notNull(), // 'assistant' | 'user' | 'system'
  content: text("content").notNull(),
  messageType: text("message_type"), // 'text' | 'job_info' | 'ats_score' | 'gaps' | 'contacts' | 'email' | 'resume_rewrite'
  metadata: jsonb("metadata"), // JSON for structured data
  createdAt: timestamp("created_at").defaultNow(),
});

// Type exports for use in the app
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Thread = typeof threads.$inferSelect;
export type NewThread = typeof threads.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

