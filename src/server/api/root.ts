import { createTRPCRouter } from "~/server/api/trpc";
import { youtubeRouter } from "./routers/youtube";
import { roomRouter } from "./routers/room";
import { userRouter } from "./routers/user";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  youtube: youtubeRouter,
  room: roomRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
