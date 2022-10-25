import { z } from 'zod';
import { createProtectedRouter } from './context';
import { env } from '../../env/server.mjs';
import { s3 } from '../../utils/aws';

export const getObjectKey = ({ userId, recipeId }: { userId: string; recipeId: string }) => {
  return `${userId}/${recipeId}`;
};

export const s3Router = createProtectedRouter()
  // CREATE
  .mutation('createPresignedUrl', {
    input: z.object({
      recipeId: z.string(),
    }),
    resolve({ ctx, input }) {
      const { recipeId } = input;

      return new Promise((resolve, reject) => {
        s3.createPresignedPost(
          {
            Fields: {
              key: getObjectKey({
                userId: ctx.session.user.id,
                recipeId: recipeId,
              }),
            },
            Conditions: [
              ['starts-with', '$Content-Type', ''],
              ['content-length-range', 0, 20000000],
            ],
            Expires: 30,
            Bucket: env.BUCKET_NAME,
          },
          (err, signed) => {
            if (err) return reject(err);
            resolve(signed);
          },
        );
      });
    },
  })

  // READ
  .query('getPresignedUrl', {
    input: z.object({
      recipeId: z.string(),
    }),
    resolve: ({ ctx, input }) => {
      const { recipeId } = input;
      const params = {
        Bucket: env.BUCKET_NAME,
        Key: getObjectKey({
          userId: ctx.session.user.id,
          recipeId: recipeId,
        }),
      };
      return s3.getSignedUrl('getObject', params);
    },
  })
  .query('getMultiplePresignedUrls', {
    input: z.object({
      arrayOfRecipeIds: z.array(z.string()).nullable(),
    }),
    resolve: ({ ctx, input }) => {
      const { arrayOfRecipeIds } = input;
      if (!arrayOfRecipeIds) return null;

      const map = new Map();
      arrayOfRecipeIds.forEach((recipeId) => {
        const params = {
          Bucket: env.BUCKET_NAME,
          Key: getObjectKey({
            userId: ctx.session.user.id,
            recipeId: recipeId,
          }),
        };
        map.set(recipeId, s3.getSignedUrl('getObject', params));
        // return s3.getSignedUrl('getObject', params);
      });
      return map;
    },
  });

// UPDATE

// DELETE
