import { clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import getDiscordUser from "~/server/discordHelper";
export const userRouter = createTRPCRouter({
  upsertUser: protectedProcedure.mutation(async ({ ctx }) => {
    const clerkUser = await clerkClient.users.getUser(ctx.userId);
    if (!clerkUser.externalAccounts[0])
      throw new TRPCError({
        message: "Discord Account Not Found",
        code: "NOT_FOUND",
      });
    const discordUser = await getDiscordUser(
      clerkUser.externalAccounts[0].externalId
    );
    return ctx.prisma.user.upsert({
      where: { id: ctx.userId },
      update: {
        name: discordUser.username,
        image: discordUser.avatar,
        discriminator: discordUser.discriminator,
      },
      create: {
        id: ctx.userId,
        name: discordUser.username,
        image: discordUser.avatar,
        discriminator: discordUser.discriminator,
      },
    });
  }),
  updateTag: protectedProcedure
    .input(z.object({ displayTag: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.update({
        where: { id: ctx.userId },
        data: { displayTag: input.displayTag },
      });
      return user;
    }),
  getUser: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findUnique({ where: { id: ctx.userId } });
  }),
});
