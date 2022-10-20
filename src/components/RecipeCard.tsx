import React from 'react';
import { inferQueryOutput } from '../utils/trpc';
import { useSetAtom } from 'jotai';
import { selectedRecipeAtom } from '../state/atoms';

interface RecipeCardProps {
  recipe: inferQueryOutput<'recipe.get-all'>[number];
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const setSelectedRecipe = useSetAtom(selectedRecipeAtom);

  return (
    <div className='flex w-full flex-col gap-2 overflow-hidden rounded-xl bg-zinc-400'>
      <h1 className='cursor-pointer bg-zinc-600 py-2 px-4 text-xl font-semibold text-zinc-200' onClick={() => setSelectedRecipe(recipe)}>
        {recipe.name}
      </h1>
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
