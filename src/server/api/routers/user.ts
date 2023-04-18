import { clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import getDiscordUser from "~/server/discordHelper";
import dayjs from "dayjs";
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
    const prismaUser = await ctx.prisma.user.findUnique({
      where: { id: ctx.userId },
    });
    const avatar = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}`
      : "";
    if (!prismaUser)
      return ctx.prisma.user.create({
        data: {
          id: ctx.userId,
          name: discordUser.username,
          image: avatar,
          discriminator: null,
        },
      });
    if (
      dayjs(prismaUser.lastUpdated)
        .add(5, "minutes")
        .isBefore(dayjs(), "minute")
    )
      return ctx.prisma.user.update({
        where: { id: ctx.userId },
        data: {
          name: discordUser.username,
          image: avatar,
          discriminator: prismaUser.discriminator
            ? discordUser.discriminator
            : null,
        },
      });
  }),
  updateTag: protectedProcedure
    .input(z.object({ displayTag: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      let discriminator: string | null = null;
      const clerkUser = await clerkClient.users.getUser(ctx.userId);
      if (!clerkUser.externalAccounts[0])
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Discord Account Not Found",
        });
      const discordId = clerkUser.externalAccounts[0].externalId;
      if (input.displayTag)
        discriminator = (await getDiscordUser(discordId)).discriminator;
      return ctx.prisma.user.update({
        where: { id: ctx.userId },
        data: { discriminator },
      });
    }),
  getUser: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findUnique({ where: { id: ctx.userId } });
  }),
  deleteUser: protectedProcedure.mutation(async ({ ctx }) => {
    const prismaPromise = ctx.prisma.user.delete({ where: { id: ctx.userId } });
    const clerkPromise = clerkClient.users.deleteUser(ctx.userId);
    await Promise.all([prismaPromise, clerkPromise]);
    return "Deleted";
  }),
  getUserInRoom: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.userId) return null;
    return (
      await ctx.prisma.user.findUniqueOrThrow({
        where: { id: ctx.userId },
        select: { roomId: true },
      })
    ).roomId;
  }),
});
