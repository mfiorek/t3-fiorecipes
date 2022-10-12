/*
  Warnings:

  - You are about to drop the column `unit` on the `Ingredient` table. All the data in the column will be lost.
  - Added the required column `unitType` to the `Ingredient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit` to the `IngredientOnRecipe` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('MASS', 'VOLUME');

-- AlterTable
ALTER TABLE "Ingredient" DROP COLUMN "unit",
ADD COLUMN     "unitType" "UnitType" NOT NULL;

-- AlterTable
ALTER TABLE "IngredientOnRecipe" ADD COLUMN     "unit" TEXT NOT NULL;
