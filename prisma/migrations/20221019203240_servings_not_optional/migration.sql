/*
  Warnings:

  - Made the column `servings` on table `Recipe` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Recipe" ALTER COLUMN "servings" SET NOT NULL;
