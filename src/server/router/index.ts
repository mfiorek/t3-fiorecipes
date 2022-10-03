// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { recipeRouter } from "./recipe";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("recipe.", recipeRouter)

// export type definition of API
export type AppRouter = typeof appRouter;
