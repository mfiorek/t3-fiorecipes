import { z } from 'zod';
import { createProtectedRouter } from './context';

export const tagRouter = createProtectedRouter()
  // CREATE
  .mutation('add-tag', {
    input: z.object({
      id: z.string(),
      name: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      const { id, name } = input;
      return await ctx.prisma.tag.create({
        data: {
          id,
          name,
          userId: ctx.session.user.id,
        },
      });
    },
  })

  // READ
  .query('get-all', {
    resolve: async ({ ctx }) => {
      return await ctx.prisma.tag.findMany({
        where: {
          userId: ctx.session.user.id,
        },
      });
    },
  });

// UPDATE

// DELETE
