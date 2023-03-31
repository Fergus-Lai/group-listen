import { createTRPCRouter } from "~/server/api/trpc";
import { exampleRouter } from "~/server/api/routers/example";
import { settingRouter } from "./routers/setting";
import { youtubeRouter } from "./routers/youtube";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  setting: settingRouter,
  youtube: youtubeRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
