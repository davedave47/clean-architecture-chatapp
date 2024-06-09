-- Add a new column with a UUID type
ALTER TABLE "users" ADD COLUMN "uuid_id" uuid DEFAULT gen_random_uuid();

-- If you want to copy data from the id column, you can do it here.
-- However, since there's no direct conversion from integer to UUID, you might need to use a different approach.

-- Drop the old id column
ALTER TABLE "users" DROP COLUMN "id";

-- Rename the new uuid_id column to id
ALTER TABLE "users" RENAME COLUMN "uuid_id" TO "id";