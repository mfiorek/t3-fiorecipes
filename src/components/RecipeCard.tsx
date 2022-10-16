import React from 'react';
import { Recipe } from '@prisma/client';

interface RecipeCardProps {
  recipe: Recipe & { tags: { id: string; name: string }[]; ingredientOnRecipe: { quantity: number; unit: string; ingredient: { id: string; name: string } }[] };
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  return (
    <div className='flex w-full flex-col gap-2 overflow-hidden rounded-xl bg-zinc-400 lg:w-[32rem]'>
      <h1 className='bg-zinc-600 py-2 px-4 text-xl font-semibold text-zinc-200'>{recipe.name}</h1>
      <div className='flex flex-col gap-4 p-4 pt-0'>
        <p className='py-2'>{recipe.desc}</p>
        <div className='flex gap-2'>
          <span>Ingredients: {recipe.ingredientOnRecipe.map((ior) => ior.ingredient.name).join(', ')}</span>
        </div>
        <div className='flex flex-wrap gap-2'>
          {recipe.tags.map((tag) => (
            <div key={tag.id} className='rounded-full bg-lime-600 px-3'>
              {tag.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
