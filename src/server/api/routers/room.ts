import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

import ReRegExp from "reregexp";
import { pusherServerClient } from "~/server/pusher";

import { TRPCError } from "@trpc/server";

const idReReg = new ReRegExp(/[A-Z0-9]{6}/);

const artistString = (artists: string[]) => {
  return artists.join(", ");
};

export const roomRouter = createTRPCRouter({
  connected: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const roomData = await ctx.prisma.room.findUnique({
        where: { id: input.roomId },
        include: {
          users: true,
          playlist: true,
        },
      });
      if (!roomData) throw Error("Room Not Found");
      if (!roomData.playlist)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playlist Not Found",
        });
      if (roomData.users.findIndex((user) => user.id == ctx.userId) === -1) {
        const user = await ctx.prisma.user.update({
          where: { id: ctx.userId },
          data: { roomId: input.roomId },
        });
        void pusherServerClient.trigger(
          "room-" + input.roomId,
          "user-connected",
          user
        );
        roomData.users.push(user);
        if (!roomData) throw Error("Room Not Found");
      }
      return roomData;
    }),
  disconnected: protectedProcedure
    .input(z.object({ roomId: z.string(), owner: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const room = await ctx.prisma.room.findUniqueOrThrow({
        where: { id: input.roomId },
        include: {
          _count: {
            select: { users: true },
          },
        },
      });
      if (room.ownerId === ctx.userId || room._count.users <= 1) {
        await ctx.prisma.room.delete({ where: { id: input.roomId } });
        await pusherServerClient.trigger(
          "room-" + input.roomId,
          "closed",
          null
        );
      } else {
        await pusherServerClient.trigger(
          "room-" + input.roomId,
          "user-disconnected",
          {
            id: ctx.userId,
          }
        );
      }
      const user = await ctx.prisma.user.update({
        where: { id: ctx.userId },
        data: { roomId: null },
      });
    }),
  create: protectedProcedure
    .input(
      z.object({
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
          ownerId: ctx.userId,
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
        where: { id: ctx.userId },
        data: { roomId: id },
      });
      await Promise.all([createSong, linkUser]);
      return id;
    }),
  songEnded: protectedProcedure.mutation(async ({ ctx }) => {
    const prismaResult = await ctx.prisma.user.findUnique({
      where: { id: ctx.userId },
      include: {
        room: { select: { playlist: true, ownerId: true, index: true } },
      },
    });
    if (!prismaResult)
      throw new TRPCError({ code: "NOT_FOUND", message: "User Not Found" });
    if (!prismaResult.room || !prismaResult.roomId)
      throw new TRPCError({ code: "NOT_FOUND", message: "User Not In Room" });
    if (prismaResult.room.ownerId !== ctx.userId)
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User Not The Owner Of The Room",
      });
    const index = prismaResult.room.index + 1;
    if (index >= prismaResult.room.playlist.length) {
      void pusherServerClient.trigger(
        "room-" + prismaResult.roomId,
        "closed",
        null
      );
      void ctx.prisma.room.delete({ where: { id: prismaResult.roomId } });
    } else {
      void pusherServerClient.trigger(
        "room-" + prismaResult.roomId,
        "new-song",
        prismaResult.room.playlist[index]
      );
      void ctx.prisma.room.update({
        where: { id: prismaResult.roomId },
        data: { index },
      });
    }
  }),
  sendMessage: protectedProcedure
    .input(z.object({ message: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.userId },
      });
      if (!user)
        throw new TRPCError({ message: "User Not Found", code: "NOT_FOUND" });
      if (!user.roomId)
        throw new TRPCError({
          message: "User Not In Room",
          code: "BAD_REQUEST",
        });
      await pusherServerClient.trigger("room-" + user.roomId, "new-message", {
        message: {
          name: `${user.name}${
            user.discriminator ? `#${user.discriminator}` : ""
          }`,
          message: input.message,
        },
      });
    }),
  songStateChange: protectedProcedure
    .input(z.object({ playing: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const prismaResult = await ctx.prisma.user.findUnique({
        where: { id: ctx.userId },
        include: {
          room: { select: { ownerId: true } },
        },
      });
      if (!prismaResult)
        throw new TRPCError({ message: "User Not Found", code: "NOT_FOUND" });
      if (!prismaResult.room || !prismaResult.roomId)
        throw new TRPCError({
          message: "User Not In Room",
          code: "BAD_REQUEST",
        });
      if (prismaResult.room.ownerId !== ctx.userId)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User Not The Owner Of The Room",
        });
      void pusherServerClient.trigger(
        "room-" + prismaResult.roomId,
        "song-state",
        {
          playing: input.playing,
        }
      );
    }),
  infiniteRoom: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input: { limit, cursor } }) => {
      const rooms = await ctx.prisma.room.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          playlist: true,
          users: true,
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (rooms.length > limit) {
        const nextRoom = rooms.pop(); // return the last item from the array
        nextCursor = nextRoom?.id;
      }
      return {
        rooms,
        nextCursor,
      };
    }),
});
