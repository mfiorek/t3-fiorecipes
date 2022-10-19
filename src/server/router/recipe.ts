import { z } from 'zod';
import { createProtectedRouter } from './context';

export const recipeRouter = createProtectedRouter()
  // CREATE
  .mutation('create', {
    input: z.object({
      name: z.string(),
      desc: z.string().nullable(),
      prepTime: z.number().nullable(),
      cooktime: z.number().nullable(),
      servings: z.number(),
      steps: z.array(z.string()),
      ingredients: z.array(
        z.object({
          ingredientId: z.string(),
          quantity: z.number(),
          unit: z.string(),
        }),
      ),
      tags: z.array(z.string()).nullable(),
    }),
    resolve: async ({ ctx, input }) => {
      const { name, desc, prepTime, cooktime, servings, steps, ingredients, tags } = input;
      return await ctx.prisma.recipe.create({
        data: {
          name: name,
          desc: desc,
          prepTime: prepTime,
          cookTime: cooktime,
          servings: servings,
          steps: steps,
          ingredientOnRecipe: {
            create: ingredients.map((ingredient) => ({
              ingredientId: ingredient.ingredientId,
              quantity: ingredient.quantity,
              unit: ingredient.unit,
            })),
          },
          tags: {
            connect: tags?.map((tag) => ({
              id: tag,
            })),
          },
          userId: ctx.session.user.id,
        },
      });
    },
  })

  // READ
  .query('get-all', {
    resolve: async ({ ctx }) => {
      return await ctx.prisma.recipe.findMany({
        where: {
          userId: ctx.session.user.id,
        },
        include: {
          ingredientOnRecipe: {
            select: {
              quantity: true,
              unit: true,
              ingredient: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          tags: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    },
  })
  .query('get-one', {
    input: z.object({
      id: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      const { id } = input;
      return await ctx.prisma.recipe.findFirst({
        where: {
          userId: ctx.session.user.id,
          id,
        },
        include: {
          ingredientOnRecipe: {
            select: {
              quantity: true,
              unit: true,
              ingredient: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          tags: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    },
  });

// UPDATE

// DELETE
