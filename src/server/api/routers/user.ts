import { clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { REST } from "@discordjs/rest";
import { Routes, RESTGetAPIUserResult } from "discord-api-types/v9";
import { env } from "~/env.mjs";
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
      if (!input.displayTag) {
        const clerkUser = await clerkClient.users.getUser(ctx.userId);
        if (!clerkUser.externalAccounts[0]) return;
        const rest = new REST().setToken(env.DISCORD_TOKEN);
        const discordUser = await (rest.get(
          Routes.user(clerkUser.externalAccounts[0].externalId)
        ) as Promise<RESTGetAPIUserResult>);

        discriminator = discordUser.discriminator;
      } else {
        discriminator = null;
      }
      const user = await ctx.prisma.user.update({
        where: { id: ctx.userId },
        data: { discriminator: discriminator },
      });
      return user;
    }),
  getUser: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findUnique({ where: { id: ctx.userId } });
  }),
});
