import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { nanoid } from "nanoid";
import { z } from "zod";
import { applications } from "./application";

export const protocolType = pgEnum("protocolType", ["tcp", "udp"]);

export const ports = pgTable("port", {
	portId: text("portId")
		.notNull()
		.primaryKey()
		.$defaultFn(() => nanoid()),
	publishedPort: varchar("publishedPort", { length: 11 }).notNull(),
	targetPort: varchar("targetPort", { length: 11 }).notNull(),
	protocol: protocolType("protocol").notNull(),

	applicationId: text("applicationId")
		.notNull()
		.references(() => applications.applicationId, { onDelete: "cascade" }),
});

export const portsRelations = relations(ports, ({ one }) => ({
	application: one(applications, {
		fields: [ports.applicationId],
		references: [applications.applicationId],
	}),
}));

const createSchema = createInsertSchema(ports, {
	portId: z.string().min(1),
	applicationId: z.string().min(1),
	publishedPort: z.string(),
	targetPort: z.string(),
	protocol: z.enum(["tcp", "udp"]).default("tcp"),
});

export const apiCreatePort = createSchema
	.pick({
		publishedPort: true,
		targetPort: true,
		protocol: true,
		applicationId: true,
	})
	.required();

export const apiFindOnePort = createSchema
	.pick({
		portId: true,
	})
	.required();

export const apiUpdatePort = createSchema
	.pick({
		portId: true,
		publishedPort: true,
		targetPort: true,
		protocol: true,
	})
	.required();
