ALTER TABLE "resources" ADD COLUMN "source" text;--> statement-breakpoint
UPDATE "resources" SET "source" = 'legacy:' || "id" WHERE "source" IS NULL;--> statement-breakpoint
ALTER TABLE "resources" ALTER COLUMN "source" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "resources_source_unique" ON "resources" USING btree ("source");