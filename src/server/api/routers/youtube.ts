import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { searchMusics } from "node-youtube-music";

export const youtubeRouter = createTRPCRouter({
  search: publicProcedure
    .input(z.object({ target: z.string() }))
    .query(async ({ input }) => {
      return await searchMusics(input.target);
    }),
});
