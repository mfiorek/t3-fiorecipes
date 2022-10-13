import { createProtectedRouter } from './context';

export const tagRouter = createProtectedRouter()
  // CREATE

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
