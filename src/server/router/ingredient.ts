import { UnitType } from '@prisma/client';
import { z } from 'zod';
import { createProtectedRouter } from './context';

const zodUnitTypes: z.ZodType<UnitType> = z.enum(['mass', 'volume']);

export const ingredientRouter = createProtectedRouter()
  // CREATE
  .mutation('add-ingredient', {
    input: z.object({
      id: z.string(),
      name: z.string(),
      unitType: zodUnitTypes,
    }),
    resolve: async ({ ctx, input }) => {
      const { id, name, unitType } = input;
      return await ctx.prisma.ingredient.create({
        data: {
          id,
          name,
          unitType,
          userId: ctx.session.user.id,
        },
      });
    },
  })

  // READ
  .query('get-all', {
    resolve: async ({ ctx }) => {
      return await ctx.prisma.ingredient.findMany({
        where: {
          userId: ctx.session.user.id,
        },
      });
    },
  });

// UPDATE

// DELETE
