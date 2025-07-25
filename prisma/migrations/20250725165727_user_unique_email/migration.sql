-- DropIndex
DROP INDEX "User_email_key";

-- DropIndex
DROP INDEX "User_totpSecret_key";

-- This is an empty migration.
CREATE UNIQUE INDEX User_email_unique
   ON "User" (email)
   WHERE "deletedAt" IS NULL;