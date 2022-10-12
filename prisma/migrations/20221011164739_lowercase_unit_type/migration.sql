/*
  Warnings:

  - The values [MASS,VOLUME] on the enum `UnitType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UnitType_new" AS ENUM ('mass', 'volume');
ALTER TABLE "Ingredient" ALTER COLUMN "unitType" TYPE "UnitType_new" USING ("unitType"::text::"UnitType_new");
ALTER TYPE "UnitType" RENAME TO "UnitType_old";
ALTER TYPE "UnitType_new" RENAME TO "UnitType";
DROP TYPE "UnitType_old";
COMMIT;
