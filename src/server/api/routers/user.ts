import { clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  upsertUser: protectedProcedure.mutation(async ({ ctx }) => {
    return ctx.prisma.user.upsert({
      where: { id: ctx.userId },
      update: {},
      create: {
        id: ctx.userId,
      },
    });
  }),
  updateTag: protectedProcedure
    .input(z.object({ displayTag: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      let discriminator: string | null;
      if (input.displayTag) {
        discriminator = "9564";
      } else {
        discriminator = null;
      }
      const user = await ctx.prisma.user.update({
        where: { id: ctx.userId },
        data: { discriminator: discriminator },
      });
      console.log(user);
      return user;
    }),
  getUser: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findUnique({ where: { id: ctx.userId } });
  }),
});
