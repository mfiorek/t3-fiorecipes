// src/server/router/index.ts
import { createRouter } from './context';
import superjson from 'superjson';

import { recipeRouter } from './recipe';
import { ingredientRouter } from './ingredient';
import { tagRouter } from './tag';
import { s3Router } from './s3';

export const appRouter = createRouter()
  .transformer(superjson)
  .merge('recipe.', recipeRouter)
  .merge('ingredient.', ingredientRouter)
  .merge('tag.', tagRouter)
  .merge('s3.', s3Router);

// export type definition of API
export type AppRouter = typeof appRouter;
