-- DropForeignKey
ALTER TABLE "Ingredient" DROP CONSTRAINT "Ingredient_userId_fkey";

-- DropForeignKey
ALTER TABLE "IngredientOnRecipe" DROP CONSTRAINT "IngredientOnRecipe_ingredientId_fkey";

-- DropForeignKey
ALTER TABLE "IngredientOnRecipe" DROP CONSTRAINT "IngredientOnRecipe_recipeId_fkey";

-- DropForeignKey
ALTER TABLE "Recipe" DROP CONSTRAINT "Recipe_userId_fkey";

-- DropForeignKey
ALTER TABLE "RecipeOnShoplist" DROP CONSTRAINT "RecipeOnShoplist_recipeId_fkey";

-- DropForeignKey
ALTER TABLE "RecipeOnShoplist" DROP CONSTRAINT "RecipeOnShoplist_shoplistId_fkey";

-- DropForeignKey
ALTER TABLE "Shoplist" DROP CONSTRAINT "Shoplist_userId_fkey";

-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_userId_fkey";

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientOnRecipe" ADD CONSTRAINT "IngredientOnRecipe_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientOnRecipe" ADD CONSTRAINT "IngredientOnRecipe_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shoplist" ADD CONSTRAINT "Shoplist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeOnShoplist" ADD CONSTRAINT "RecipeOnShoplist_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeOnShoplist" ADD CONSTRAINT "RecipeOnShoplist_shoplistId_fkey" FOREIGN KEY ("shoplistId") REFERENCES "Shoplist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
