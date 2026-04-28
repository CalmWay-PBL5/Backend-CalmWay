BEGIN;

-- Update FK before moving tables across schemas.
ALTER TABLE "lesson"."lessons"
  DROP CONSTRAINT IF EXISTS "lessons_class_id_fkey";

-- Move course objects into lesson schema.
ALTER TABLE "course"."subjects" SET SCHEMA "lesson";
ALTER TABLE "course"."classes" SET SCHEMA "lesson";
ALTER TABLE "course"."enrollments" SET SCHEMA "lesson";
ALTER TABLE "course"."class_teachers" SET SCHEMA "lesson";

ALTER TYPE "course"."ClassType" SET SCHEMA "lesson";
ALTER TYPE "course"."ClassStatus" SET SCHEMA "lesson";

-- Recreate FK to the new table location.
ALTER TABLE "lesson"."lessons"
  ADD CONSTRAINT "lessons_class_id_fkey"
  FOREIGN KEY ("class_id") REFERENCES "lesson"."classes"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop empty old schema.
DROP SCHEMA IF EXISTS "course";

COMMIT;
