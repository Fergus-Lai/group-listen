import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { searchMusics } from "node-youtube-music";

export const youtubeRouter = createTRPCRouter({
  search: publicProcedure
    .input(z.object({ target: z.string(), type: z.string() }))
    .query(async ({ input }) => {
      switch (input.type) {
        case "Music":
          const result = await searchMusics(input.target);
          return result;
        default:
          break;
      }
    }),
});
