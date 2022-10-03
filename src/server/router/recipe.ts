import { z } from 'zod';
import { createProtectedRouter } from './context';

export const recipeRouter = createProtectedRouter()
  // CREATE

  // READ
  .query('get-all', {
    resolve: async ({ ctx }) => {
      return await ctx.prisma.recipe.findMany({
        where: {
          userId: ctx.session.user.id,
        },
      });
    },
  });

// UPDATE

// DELETE
