import { z } from 'zod';
import { createProtectedRouter } from './context';

export const recipeRouter = createProtectedRouter()
  // CREATE
  .mutation('create', {
    input: z.object({
      id: z.string(),
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
      const { id, name, desc, prepTime, cooktime, servings, steps, ingredients, tags } = input;
      return await ctx.prisma.recipe.create({
        data: {
          id: id,
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

  // UPDATE
  .mutation('update', {
    input: z.object({
      id: z.string(),
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
      const { id, name, desc, prepTime, cooktime, servings, steps, ingredients, tags } = input;
      return await ctx.prisma.recipe.update({
        where: {
          id,
        },
        data: {
          name: name,
          desc: desc,
          prepTime: prepTime,
          cookTime: cooktime,
          servings: servings,
          steps: steps,
          ingredientOnRecipe: {
            deleteMany: {
              NOT: ingredients.map((ingredient) => ({ recipeId: id, ingredientId: ingredient.ingredientId })),
            },
            upsert: ingredients.map((ingredient) => ({
              where: {
                recipeId_ingredientId: { recipeId: id, ingredientId: ingredient.ingredientId },
              },
              create: {
                ingredientId: ingredient.ingredientId,
                quantity: ingredient.quantity,
                unit: ingredient.unit,
              },
              update: {
                quantity: ingredient.quantity,
                unit: ingredient.unit,
              },
            })),
          },
          tags: {
            set: tags?.map((tag) => ({ id: tag })),
          },
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

  // DELETE
  .mutation('delete', {
    input: z.object({
      id: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      const { id } = input;
      return await ctx.prisma.recipe.delete({
        where: {
          id,
        },
      });
    },
  });
