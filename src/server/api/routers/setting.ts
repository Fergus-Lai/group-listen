import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const settingRouter = createTRPCRouter({
  updateDisplayTag: protectedProcedure
    .input(z.object({ displayTag: z.boolean() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: { displayTag: input.displayTag },
      });
    }),
});
