import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

import ReRegExp from "reregexp";
import { pusherServerClient } from "~/server/pusher";

import { generateUsername } from "unique-username-generator";

import { type UserData } from "~/interfaces/userData";

const idReReg = new ReRegExp(/[A-Z0-9]{6}/);

const artistString = (artists: string[]) => {
  return artists.join(", ");
};

export const roomRouter = createTRPCRouter({
  connected: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const roomData = await ctx.prisma.room.findUnique({
        where: { id: input.roomId },
        include: {
          users: {
            select: {
              id: true,
              discriminator: true,
              image: true,
              name: true,
              displayTag: true,
            },
          },
        },
      });
      if (!roomData) throw Error("Room Not Found");
      if (
        !(
          ctx.session.user.name &&
          ctx.session.user.image &&
          ctx.session.user.discriminator
        )
      )
        throw Error("No Session Info");
      if (roomData.users.findIndex((user) => user.id == userId) === -1) {
        try {
          await ctx.prisma.user.update({
            where: { id: userId },
            data: { roomId: input.roomId },
          });
        } catch (e) {
          throw e;
        }
        const userData: UserData = {
          id: ctx.session.user.id,
          name: "",
          image: null,
          discriminator: null,
          displayTag: ctx.session.user.displayTag,
        };
        if (roomData.anonymous) {
          userData.name = generateUsername("-", 2, 20);
        } else {
          userData.name = ctx.session.user.name;
          userData.image = ctx.session.user.image;
          if (ctx.session.user.displayTag)
            userData.discriminator = ctx.session.user.discriminator;
        }
        void pusherServerClient.trigger(input.roomId, "connected", userData);
        roomData.users.push({
          id: ctx.session.user.id,
          name: userData.name,
          image: ctx.session.user.image,
          discriminator: ctx.session.user.discriminator,
          displayTag: ctx.session.user.displayTag,
        });
        if (!roomData) throw Error("Room Not Found");
      }
      roomData.users.map((user) =>
        user.displayTag ? user : { ...user, discriminator: null }
      );
      return roomData;
    }),
  disconnected: protectedProcedure
    .input(z.object({ roomId: z.string(), owner: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.update({
        where: { id: ctx.currentUser.id },
        data: { roomId: null },
      });
      if (input.owner) {
        await ctx.prisma.room.delete({ where: { id: input.roomId } });
        await pusherServerClient.trigger(input.roomId, "closed", null);
      } else {
        await pusherServerClient.trigger(input.roomId, "disconnected", {
          id: user.id,
        });
      }
    }),
  create: protectedProcedure
    .input(
      z.object({
        anonymous: z.boolean(),
        chat: z.boolean(),
        playlist: z
          .object({
            youtubeId: z.string(),
            title: z.string(),
            thumbnailUrl: z.string(),
            artists: z.string().array(),
          })
          .array(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      let id: string;
      const allRoom = await ctx.prisma.room.findMany({
        select: { id: true },
      });
      const allRoomId = allRoom ? allRoom.map((room) => room.id) : [];
      while (true) {
        id = idReReg.build();
        if (allRoomId.findIndex((roomId) => roomId === id) === -1) break;
      }
      await ctx.prisma.room.create({
        data: {
          id: id,
          ownerId: ctx.session.user.id,
          anonymous: input.anonymous,
          chat: input.chat,
        },
      });
      const playlist = input.playlist.map(
        ({
          youtubeId,
          title,
          artists,
          thumbnailUrl,
        }): {
          youtubeId: string;
          title: string;
          artist: string;
          thumbnail: string;
          roomId: string;
        } => {
          return {
            youtubeId,
            title,
            artist: artistString(artists),
            thumbnail: thumbnailUrl,
            roomId: id,
          };
        }
      );
      const createSong = ctx.prisma.song.createMany({ data: playlist });
      const linkUser = ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: { roomId: id },
      });
      await Promise.all([createSong, linkUser]);
      return id;
    }),
});
