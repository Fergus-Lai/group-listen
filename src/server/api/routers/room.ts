import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

import ReRegExp from "reregexp";

const idReReg = new ReRegExp(/[A-Z0-9]{6}/);

const artistString = (artists: string[]) => {
  return artists.join(", ");
};

export const roomRouter = createTRPCRouter({
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
