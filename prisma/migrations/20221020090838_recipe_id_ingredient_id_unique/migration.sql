/*
  Warnings:

  - A unique constraint covering the columns `[recipeId,ingredientId]` on the table `IngredientOnRecipe` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "IngredientOnRecipe_recipeId_ingredientId_key" ON "IngredientOnRecipe"("recipeId", "ingredientId");
